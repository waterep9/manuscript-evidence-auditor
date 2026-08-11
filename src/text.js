'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

function tryReadUtf8(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    if (text.includes('\u0000')) return null;
    return text;
  } catch {
    return null;
  }
}

function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.txt' || ext === '.md' || ext === '.csv' || ext === '.json') {
    return tryReadUtf8(filePath) || '';
  }
  if (ext === '.docx') {
    return extractDocxText(filePath);
  }
  if (ext === '.pdf' || ext === '.xlsx' || ext === '.xls') {
    return '';
  }
  return tryReadUtf8(filePath) || '';
}

function extractDocxText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const xml = readZipEntry(buffer, 'word/document.xml')
    + readZipEntry(buffer, 'word/footnotes.xml')
    + readZipEntry(buffer, 'word/endnotes.xml');
  return normalize(stripXml(xml));
}

function readZipEntry(buffer, targetName) {
  const eocdSignature = 0x06054b50;
  const centralDirectorySignature = 0x02014b50;
  const localFileSignature = 0x04034b50;

  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === eocdSignature) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) return '';

  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  let offset = centralDirectoryOffset;

  for (let entryIndex = 0; entryIndex < totalEntries; entryIndex += 1) {
    if (buffer.readUInt32LE(offset) !== centralDirectorySignature) break;
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

    if (name === targetName) {
      if (buffer.readUInt32LE(localHeaderOffset) !== localFileSignature) return '';
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const data = buffer.subarray(dataOffset, dataOffset + compressedSize);
      const payload = compressionMethod === 0
        ? data
        : compressionMethod === 8
          ? zlib.inflateRawSync(data)
          : Buffer.alloc(0);
      return payload.toString('utf8', 0, uncompressedSize);
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return '';
}

function stripXml(xml) {
  return xml
    .replace(/<w:t[^>]*>/g, '')
    .replace(/<\/w:t>/g, ' ')
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br\/>/g, '\n')
    .replace(/<w:cr\/>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, ' ');
}

function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { extractText, normalize };
