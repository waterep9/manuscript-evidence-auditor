'use strict';

const LABELS = {
  en: {
    rootDir: 'Root directory',
    outputPath: 'Output path',
    manuscriptCount: 'Manuscripts',
    sourceCount: 'Sources',
    risks: 'Risks',
    unusedSources: 'Unused sources'
  },
  zh: {
    rootDir: '根目录',
    outputPath: '输出路径',
    manuscriptCount: '稿件数量',
    sourceCount: '资料数量',
    risks: '风险提示',
    unusedSources: '未覆盖资料'
  }
};

const RISK_MESSAGES = {
  missing_reference_blocks: {
    en: 'At least one manuscript lacks an explicit reference block.',
    zh: '至少一份稿件缺少明确的参考资料或来源区块。'
  },
  low_source_consumption: {
    en: 'A large part of the source library is not visibly consumed by manuscript text.',
    zh: '资料库中较大比例的资料没有在稿件文本中形成可见消耗。'
  }
};

const SIGNAL_MESSAGES = {
  text_too_short: {
    en: 'Extracted text is too short for reliable evidence auditing.',
    zh: '抽取文本过短，证据链审计可靠性不足。'
  },
  no_reference_section: {
    en: 'No explicit reference or source section was found.',
    zh: '未发现明确的参考资料、脚注或来源区块。'
  },
  no_source_match: {
    en: 'No source file name appears to match this manuscript.',
    zh: '未发现与该稿件形成可见匹配的资料文件名。'
  }
};

function normalizeLanguage(language) {
  if (language === 'zh' || language === 'en' || language === 'bilingual') {
    return language;
  }
  return 'en';
}

function labelsFor(language) {
  if (language === 'bilingual') return { en: LABELS.en, zh: LABELS.zh };
  return LABELS[language] || LABELS.en;
}

function localizeEntry(code, catalog, language) {
  const entry = catalog[code] || { en: code, zh: code };
  if (language === 'bilingual') return { code, en: entry.en, zh: entry.zh };
  return { code, message: entry[language] || entry.en };
}

function riskDetails(codes, language) {
  return codes.map((code) => localizeEntry(code, RISK_MESSAGES, language));
}

function signalDetails(codes, language) {
  return codes.map((code) => localizeEntry(code, SIGNAL_MESSAGES, language));
}

function summaryFor(report, language) {
  const en = `Scanned ${report.manuscriptCount} manuscripts and ${report.sourceCount} sources. Found ${report.riskCodes.length} project-level risks.`;
  const zh = `已扫描 ${report.manuscriptCount} 份稿件和 ${report.sourceCount} 份资料，发现 ${report.riskCodes.length} 项项目级风险。`;
  return language === 'bilingual' ? { en, zh } : language === 'zh' ? zh : en;
}

module.exports = {
  normalizeLanguage,
  labelsFor,
  riskDetails,
  signalDetails,
  summaryFor
};
