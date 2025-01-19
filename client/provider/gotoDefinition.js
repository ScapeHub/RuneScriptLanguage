const vscode = require('vscode');
const localVarUtils = require("../utils/localVarUtils");
const identifierCache = require("../cache/identifierCache");
const matchType = require('../matching/matchType');
const { matchWordFromDocument } = require('../matching/matchWord');

const gotoDefinitionProvider = {
  async provideDefinition(document, position) {
    // Get a match for the current word, and ignore noop or hover only tagged matches
    const { match, word } = matchWordFromDocument(document, position)
    if (!match || match.noop || match.isHoverOnly) {
      return null;
    }

    // If we are already on a declaration, there is nowhere to goto. Returning current location
    // indicates to vscode that we instead want to try doing "find references"
    if (match.declaration) {
      return new vscode.Location(document.uri, position);
    }

    // Search for the identifier and its declaration location, and goto it if found
    if (match.id === matchType.LOCAL_VAR.id) {
      return gotoLocalVar(document, position, word);
    }
    return gotoDefinition(word, match);
  }
}

const gotoLocalVar = (document, position, word) => {
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const match = localVarUtils.findLocalVar(fileText, word);
  return !match ? null : new vscode.Location(document.uri, document.positionAt(match.index).translate(0, match[1].length + 1));
}

const gotoDefinition = async (word, match) => {
  const definition = identifierCache.get(word, match);
  return (definition) ? definition.declaration : null;
}

module.exports = gotoDefinitionProvider;
