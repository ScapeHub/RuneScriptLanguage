const vscode = require('vscode');
const { matchWordFromDocument } = require('../matching/matchWord');
const identifierCache = require('../cache/identifierCache');
const cacheUtils = require('../utils/cacheUtils');
const matchType = require('../matching/matchType');
const { parseScriptBlock } = require('../utils/localVarUtils');

const referenceProvider = {
  async provideReferences(document, position) {
    // Find a match for the current word, and ignore noop or hoverOnly tagged matches
    const { match, word } = matchWordFromDocument(document, position)
    if (!match || match.noop || match.isHoverOnly) {
      return null;
    }

    // Local vars handled separately
    if (match.id === matchType.LOCAL_VAR.id) {
      const { references } = parseScriptBlock(document, position, `$${word}`);
      return references.map(range => new vscode.Location(document.uri, range));
    }

    // Get the identifier from the cache
    const identifier = identifierCache.get(word, match);
    if (!identifier || !identifier.references) {
      return null;
    }

    // Decode all the references for the identifier into an array of vscode Location objects
    const referenceLocations = [];
    Object.keys(identifier.references).forEach(fileKey => {
      const uri = vscode.Uri.file(fileKey);
      identifier.references[fileKey].forEach(encodedReference => 
        referenceLocations.push(cacheUtils.decodeReferenceToLocation(uri, encodedReference)));
    });
    return referenceLocations;
  }
}

module.exports = referenceProvider;
