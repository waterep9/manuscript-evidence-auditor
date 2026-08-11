'use strict';

const REF_PATTERN = /(?:^|\n)\s*(?:【|#)?(?:参考资料|注释|脚注|引注|来源)\s*[:：]?\s*([^\n]+)?/g;
const INLINE_PATTERN = /(?:\[[^\]]+\]|\([^)]+\)|〔[^〕]+〕|《[^》]+》|“[^”]+”)/g;
const FOOTNOTE_PATTERN = /\[(\d{1,3})\]/g;

function collectMentions(text) {
  const mentions = new Map();
  const normalized = text || '';

  for (const match of normalized.matchAll(INLINE_PATTERN)) {
    const key = match[0].replace(/^[\[（(《“〔]|[\]）)》”〕]$/g, '');
    mentions.set(key, (mentions.get(key) || 0) + 1);
  }

  for (const match of normalized.matchAll(FOOTNOTE_PATTERN)) {
    const key = `footnote-${match[1]}`;
    mentions.set(key, (mentions.get(key) || 0) + 1);
  }

  return [...mentions.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function summarizeReferences(text) {
  const refs = [];
  const lines = (text || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^(参考资料|注释|脚注|来源|引文)/.test(trimmed) || /:\s*/.test(trimmed)) {
      refs.push(trimmed);
    }
  }
  return refs;
}

module.exports = { collectMentions, summarizeReferences };
