const vscode = require('vscode');

function resolveKey(name, match) {
  return (!name || !match) ? null : name + match.id;
}

function resolveFileKey(uri) {
  return (uri) ? uri.path : null;
}

function encodeReference(line, index) {
  return `${line}|${index}`;
}

function decodeReference(uri, encodedValue) {
  const split = encodedValue.split('|');
  return (split.length !== 2) ? null : new vscode.Location(uri, new vscode.Position(Number(split[0]), Number(split[1])));
}

function encodeBlockReference(startLine, identifierKey) {
  return `${startLine}|${identifierKey}`;
}

function decodeBlockReference(encodedValue) {
  const split = encodedValue.split('|');
  return (split.length !== 2) ? null : { startLine: Number(split[0]), identifierKey: split[1] };
}

module.exports = { resolveKey, resolveFileKey, encodeReference, decodeReference, encodeBlockReference, decodeBlockReference };
