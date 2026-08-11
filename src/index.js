'use strict';

const path = require('node:path');
const { auditProject, writeReport } = require('./audit');

function parseArgs(argv) {
  const positional = [];
  let language = process.env.REPORT_LANG || process.env.AUDIT_LANG || 'en';

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--lang' || arg === '--language') {
      language = argv[index + 1] || language;
      index += 1;
    } else if (arg.startsWith('--lang=')) {
      language = arg.slice('--lang='.length);
    } else {
      positional.push(arg);
    }
  }

  return { positional, language };
}

function main() {
  const { positional, language } = parseArgs(process.argv.slice(2));
  const rootDir = positional[0] || process.env.AUDIT_ROOT || path.join('D:', '青岛双百上合项目组');
  const outputPath = positional[1] || path.join(rootDir, 'reports', 'evidence-audit.json');
  const report = auditProject(rootDir, { language });
  writeReport(report, outputPath);
  console.log(JSON.stringify({
    rootDir,
    outputPath,
    language: report.language,
    manuscriptCount: report.manuscriptCount,
    sourceCount: report.sourceCount,
    summary: report.summary,
    risks: report.risks
  }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
