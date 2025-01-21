const cacheUtils = require('../utils/cacheUtils');

/**
 * This cache maintains a list of files to references of which lines in an rs2 file are a part of 
 * which block, so given a line and a fileUri, what block is that line in (proc, label, queue, etc...)
 * { filePath1: [{start: num, identifierKey: identifierKey}, ...], filePath2: ... }
 */
var blockReferenceCache = {};

function put(startLine, name, match, uri) {
  const identifierKey = cacheUtils.resolveKey(name, match);
  const fileKey = cacheUtils.resolveFileKey(uri);
  if (identifierKey && fileKey) {
    const blockReferences = blockReferenceCache[fileKey] || new Set();
    blockReferences.add(cacheUtils.encodeBlockReference(startLine, identifierKey));
    blockReferenceCache[fileKey] = blockReferences;
  }
}

function get(lineNum, uri) {
  const fileKey = cacheUtils.resolveFileKey(uri);
  const blockReferences = blockReferenceCache[fileKey] || new Set();
  let curKey;
  let curLine = 0;
  blockReferences.forEach(ref => {
    const { startLine, identifierKey } = cacheUtils.decodeBlockReference(ref);
    if (lineNum >= startLine && curLine < startLine) {
      curKey = identifierKey;
      curLine = startLine;
    }
  });
  return curKey;
}

function clearFile(uri) {
  const fileKey = cacheUtils.resolveFileKey(uri);
  if (fileKey) {
    delete blockReferenceCache[fileKey];
  }
}

function clear() {
  blockReferenceCache = {};
}

module.exports = { put, get, clear, clearFile };
