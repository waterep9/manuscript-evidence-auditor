'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { auditProject, writeReport } = require('../src/audit');

function makeTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-audit-'));
  fs.mkdirSync(path.join(root, 'chapter'), { recursive: true });
  fs.mkdirSync(path.join(root, 'sources'), { recursive: true });
  fs.writeFileSync(path.join(root, 'chapter', '第四章成稿.md'), '参考资料：A\n本文引用《案例一》与[1]。');
  fs.writeFileSync(path.join(root, 'sources', '案例一.txt'), 'source body');
  return root;
}

test('audits manuscripts and writes report', () => {
  const root = makeTempProject();
  const report = auditProject(root);
  assert.equal(report.manuscriptCount, 1);
  assert.equal(report.sourceCount, 1);
  assert.equal(report.manuscripts[0].references, 1);
  assert.equal(report.manuscripts[0].matchedSources.length, 1);

  const output = path.join(root, 'reports', 'audit.json');
  writeReport(report, output);
  assert.equal(fs.existsSync(output), true);
});
