const vscode = require('vscode');
const identifierCache = require('../cache/identifierCache');
const { matchWordFromDocument } = require('../matching/matchWord');
const cacheUtils = require('../utils/cacheUtils');
const { parseScriptBlock } = require('../utils/localVarUtils');
const matchType = require('../matching/matchType');

const renameProvider = {
  prepareRename(document, position) {
    const matchedWord = matchWordFromDocument(document, position);
    if (!matchedWord) {
      throw new Error("Cannot rename");
    }
    const { match, word, context } = matchedWord;
    if (!match.allowRename || match.noop) {
      throw new Error(`${match.id} renaming not supported`);
    }
    if (context.cert) {
      throw new Error('Please rename the non-cert object instead');
    }
    if (match.id !== matchType.LOCAL_VAR.id) {
      const identifier = identifierCache.get(word, match);
      if (!identifier) {
        return new Error('Cannot find any references to rename');
      }
    }
	},

	provideRenameEdits(document, position, newName) {
    const { word, match } = matchWordFromDocument(document, position);

    // Provide rename edits
    const renameWorkspaceEdits = new vscode.WorkspaceEdit();

    // Local vars handled separately
    if (match.id === matchType.LOCAL_VAR.id) {
      const parsed = parseScriptBlock(document, position, `$${word}`);
      if (parsed.declaration) renameWorkspaceEdits.replace(document.uri, parsed.declaration, `$${newName}`);
      if (parsed.references) parsed.references.forEach(range => renameWorkspaceEdits.replace(document.uri, range, `$${newName}`));
      return renameWorkspaceEdits;
    }

    // Decode all the references for the identifier into an array of vscode ranges,
    // then use that to rename all of the references to the newName
    const identifier = identifierCache.get(word, match);
    if (identifier.references) {
      Object.keys(identifier.references).forEach(fileKey => {
        const uri = vscode.Uri.file(fileKey);
        identifier.references[fileKey].forEach(encodedReference => {
          const range = cacheUtils.decodeReferenceToRange(word.length, encodedReference);
          renameWorkspaceEdits.replace(uri, range, newName);
        });
      });
    }
    return renameWorkspaceEdits;
	}
}

module.exports = renameProvider;
