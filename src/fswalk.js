'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SKIP = new Set(['node_modules', '.git', 'reports', 'tmp', 'manuscript-evidence-auditor']);

function walk(rootDir, options = {}) {
  const skip = new Set([...(options.skip || []), ...DEFAULT_SKIP]);
  const files = [];

  function visit(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  visit(rootDir);
  return files;
}

module.exports = { walk };
