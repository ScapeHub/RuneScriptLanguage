const vscode = require('vscode');

function endcodeReference(line, index) {
  return `${line}|${index}`;
}

function decodeReference(uri, encodedValue) {
  const split = encodedValue.split('|');
  return (split.length !== 2) ? null : new vscode.Location(uri, new vscode.Position(Number(split[0]), Number(split[1])));
}

module.exports = { endcodeReference, decodeReference };
