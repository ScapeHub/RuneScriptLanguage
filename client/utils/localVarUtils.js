const vscode = require('vscode');
const { TRIGGER_LINE } = require("../enum/regex");

const findLocalVar = (fileText, word) => {
  const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const matches = [...fileText.matchAll(new RegExp(`${varKeyword} \\$${word}(,|;|=|\\)| ){1}`, "g"))];
  return matches[matches.length - 1];
}

/**
 * Returns the declaration range, and the reference ranges for a given local variable name
 * {declaration: Range, references: Range[]}
 */
const parseScriptBlock = (document, position, varName) => {
  const response = {references: []};
  const varLength = varName.length;
  let lineNum = position.line;
  let lineText = document.lineAt(lineNum).text;
  // Find starting line of this script block
  while (lineNum > 0 && !TRIGGER_LINE.test(lineText)) {
    lineNum--;
    lineText = document.lineAt(lineNum).text;
  }
  // Parse the trigger line to see if variable is a script parameter
  var declarationIndex = lineText.indexOf(varName);
  if (declarationIndex > -1) {
    response.declaration = buildRange(lineNum, declarationIndex, varLength);
  }
  // Parse the rest of the script block
  const matchingRanges = [];
  for (++lineNum; lineNum < document.lineCount; lineNum++) {
    lineText = document.lineAt(lineNum).text;
    if (TRIGGER_LINE.test(lineText)) break; // End of script block detected
    addMatchingRanges(lineText, lineNum, varName, varLength, matchingRanges)
  }
  // Build response object => {declaration: Range, references: Range[]}
  for (const range of matchingRanges) {
    if (!response.declaration) response.declaration = range;
    else response.references.push(range);
  }
  return response;
}

function addMatchingRanges(lineText, lineNum, varName, varLength, matchingRanges) {
  let index = lineText.indexOf(varName);
  while (index > -1) {
    matchingRanges.push(buildRange(lineNum, index, varLength))
    index = lineText.indexOf(varName, index + varLength);
  }
}

function buildRange(lineNum, index, length) {
  const start = new vscode.Position(lineNum, index);
  return new vscode.Range(start, start.translate(0, length));
}

module.exports = { findLocalVar, parseScriptBlock };
