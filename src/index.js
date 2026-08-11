'use strict';

const path = require('node:path');
const { auditProject, writeReport } = require('./audit');

function main() {
  const rootDir = process.argv[2] || process.env.AUDIT_ROOT || path.join('D:', '青岛双百上合项目组');
  const outputPath = process.argv[3] || path.join(rootDir, 'reports', 'evidence-audit.json');
  const report = auditProject(rootDir);
  writeReport(report, outputPath);
  console.log(JSON.stringify({
    rootDir,
    outputPath,
    manuscriptCount: report.manuscriptCount,
    sourceCount: report.sourceCount,
    risks: report.risks
  }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { main };
