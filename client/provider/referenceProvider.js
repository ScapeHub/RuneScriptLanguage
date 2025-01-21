const vscode = require('vscode');
const { matchWordFromDocument } = require('../matching/matchWord');
const identifierCache = require('../cache/identifierCache');
const cacheUtils = require('../utils/cacheUtils');

const referenceProvider = {
  async provideReferences(document, position) {
    // Find a match for the current word, and ignore noop or hoverOnly tagged matches
    const { match, word } = matchWordFromDocument(document, position)
    if (!match || match.noop || match.isHoverOnly) {
      return null;
    }

    // If match is already a reference itself, return null as references have no children references
    if (!match.declaration) {
      return null;
    }

    // Get the declaration identifier from the cache
    const identifier = identifierCache.get(word, match);
    if (!identifier || !identifier.references) {
      return null;
    }

    // Decode all the references for the identifier into an array of vscode Location objects
    const referenceLocations = [];
    Object.keys(identifier.references).forEach(fileKey => {
      identifier.references[fileKey].forEach(encodedReference => 
        referenceLocations.push(cacheUtils.decodeReference(vscode.Uri.file(fileKey), encodedReference)));
    });
    return referenceLocations;
  }
}

module.exports = referenceProvider;
