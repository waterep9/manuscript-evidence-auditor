'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { walk } = require('./fswalk');
const { extractText, normalize } = require('./text');
const { collectMentions, summarizeReferences } = require('./references');
const {
  labelsFor,
  riskDetails,
  signalDetails,
  summaryFor
} = require('./i18n');

const DOC_EXTS = new Set(['.docx', '.doc', '.md', '.txt', '.pdf', '.xlsx', '.xls', '.csv']);
const MANUSCRIPT_PATTERN = /成稿|初稿|定稿|框架|稿|鎴愮|鍒濈|瀹氱|妗嗘灦|绋縷/;
const SOURCE_EXCLUDE_PATTERN = /成稿|初稿|定稿|框架|写作说明|鎴愮|鍒濈|瀹氱|妗嗘灦|鍐欎綔璇存槑/;

function safeRelative(baseDir, fullPath) {
  return path.relative(baseDir, fullPath).replace(/\\/g, '/');
}

function scanSources(rootDir) {
  return walk(rootDir)
    .filter((file) => DOC_EXTS.has(path.extname(file).toLowerCase()))
    .filter((file) => !SOURCE_EXCLUDE_PATTERN.test(file));
}

function scanManuscripts(rootDir) {
  return walk(rootDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.docx', '.doc', '.md', '.txt'].includes(ext) && MANUSCRIPT_PATTERN.test(file);
  });
}

function scoreCoverage(manuscriptText, sourceNames) {
  const text = manuscriptText.toLowerCase();
  const matched = [];
  for (const sourceName of sourceNames) {
    const base = sourceName.toLowerCase().replace(/\.[^.]+$/, '');
    const tokens = base.split(/[_\s\-()（）锛堬級]+/).filter(Boolean);
    const hit = tokens.some((token) => token.length >= 3 && text.includes(token.toLowerCase()));
    if (hit) matched.push(sourceName);
  }
  return [...new Set(matched)];
}

function auditProject(rootDir) {
  const manuscripts = scanManuscripts(rootDir);
  const sources = scanSources(rootDir);
  const sourceNames = sources.map((file) => path.basename(file));

  const manuscriptReports = manuscripts.map((file) => {
    const raw = extractText(file);
    const text = normalize(raw);
    const mentions = collectMentions(text);
    const references = summarizeReferences(text);
    const matchedSources = scoreCoverage(text, sourceNames);
    const missingSignals = [];

    if (text.length < 200) missingSignals.push('text_too_short');
    if (references.length === 0) missingSignals.push('no_reference_section');
    if (matchedSources.length === 0) missingSignals.push('no_source_match');

    return {
      file: safeRelative(rootDir, file),
      chars: text.length,
      references: references.length,
      mentionCount: mentions.length,
      matchedSources: matchedSources.slice(0, 12),
      missingSignals,
      signalDetails: signalDetails(missingSignals)
    };
  });

  const usedSourceNames = new Set(manuscriptReports.flatMap((r) => r.matchedSources));
  const unusedSources = sourceNames.filter((name) => !usedSourceNames.has(name));

  const riskCodes = [];
  if (manuscriptReports.some((r) => r.missingSignals.includes('no_reference_section'))) {
    riskCodes.push('missing_reference_blocks');
  }
  if (unusedSources.length > Math.max(5, sourceNames.length * 0.4)) {
    riskCodes.push('low_source_consumption');
  }

  const report = {
    rootDir,
    language: 'zh',
    labels: labelsFor(),
    manuscriptCount: manuscriptReports.length,
    sourceCount: sourceNames.length,
    manuscripts: manuscriptReports.sort((a, b) => a.file.localeCompare(b.file)),
    unusedSources: unusedSources.slice(0, 30),
    riskCodes,
    risks: riskDetails(riskCodes)
  };
  report.summary = summaryFor(report);
  return report;
}

function writeReport(report, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
}

module.exports = { auditProject, writeReport };
