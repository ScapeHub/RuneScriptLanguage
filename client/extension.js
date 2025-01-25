const vscode = require('vscode');
const hoverProvider = require('./provider/hoverProvider');
const recolorProvider = require('./provider/recolorProvider');
const definitionProvider = require('./provider/gotoDefinition');
const referenceProvider = require('./provider/referenceProvider');
const renameProvider = require('./provider/renameProvider');
const cacheManager = require('./cache/cacheManager');
const commands = require('./provider/vscodeCommands');

const languages = ['runescript','locconfig','objconfig','npcconfig','dbtableconfig','dbrowconfig','paramconfig','structconfig','enumconfig','varpconfig','varnconfig','varsconfig','invconfig','seqconfig','spotanimconfig','mesanimconfig','idkconfig','huntconfig','constants','interface','pack'];

function activate(context) {
    // Register commands created by this extension
    Object.keys(commands).forEach(key => 
        context.subscriptions.push(vscode.commands.registerCommand(commands[key].id, commands[key].command)));

    // Populate cache on extension activation
    vscode.commands.executeCommand(commands.rebuildCache.id); 

    // Cache processing event handlers for git branch changes, updating files, create/rename/delete files
    vscode.workspace.createFileSystemWatcher('**/.git/HEAD').onDidCreate(() => vscode.commands.executeCommand(commands.rebuildCache.id));
    vscode.workspace.onDidSaveTextDocument(saveDocumentEvent => cacheManager.rebuildFile(saveDocumentEvent.uri));
    vscode.workspace.onDidDeleteFiles(filesDeletedEvent => cacheManager.clearFiles(filesDeletedEvent.files));
    vscode.workspace.onDidRenameFiles(filesRenamedEvent => cacheManager.renameFiles(filesRenamedEvent.files));
    vscode.workspace.onDidCreateFiles(filesCreatedEvent => cacheManager.createFiles(filesCreatedEvent.files));

    // Register hover, definition, and reference providers
    for (const language of languages) {
        vscode.languages.registerHoverProvider(language, hoverProvider(context));
        vscode.languages.registerRenameProvider(language, renameProvider);
        context.subscriptions.push(vscode.languages.registerDefinitionProvider(language, definitionProvider));
        context.subscriptions.push(vscode.languages.registerReferenceProvider(language, referenceProvider));
    }

    // Register color providers 
    vscode.languages.registerColorProvider('locconfig', recolorProvider);
    vscode.languages.registerColorProvider('npcconfig', recolorProvider);
    vscode.languages.registerColorProvider('objconfig', recolorProvider);
    vscode.languages.registerColorProvider('spotanimconfig', recolorProvider);
    vscode.languages.registerColorProvider('idkconfig', recolorProvider);
}

function deactivate() {
    cacheManager.clearAll();
 }

module.exports = {
    activate,
    deactivate
};
