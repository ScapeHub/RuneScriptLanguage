const vscode = require('vscode');
const cacheProcessor = require('../cache/cacheProcessor');

const commands = {
  rebuildCache: {
    id: 'RuneScriptLanguage.rebuildCache',
    command: () => {
      vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: "Runescript Extension: Building cache / Indexing files...",
          cancellable: false
      }, cacheProcessor.rebuildAll);
    }
  }
};

module.exports = commands;
