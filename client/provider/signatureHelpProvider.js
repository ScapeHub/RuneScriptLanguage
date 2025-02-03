const vscode = require('vscode');
const { getBaseContext } = require('../utils/matchUtils');
const { getParamsIdentifier } = require('../utils/paramMatchingUtils');
const matchType = require('../matching/matchType');
const { get } = require('../cache/identifierCache');

const metadata = {
  triggerCharacters: ['(', ','], 
  retriggerCharacters: [',']
}

const provider = {
  provideSignatureHelp(document, position) {
    // Get parameter identifier
    let str = document.lineAt(position.line).text;
    str = str.substring(0, position.character) + 'temp' + str.substring(position.character);
    const matchContext = getBaseContext(str, position.line, document.uri);
    matchContext.lineIndex = position.character + 1;
    var paramIden = getParamsIdentifier(matchContext);
    if (!paramIden) {
      return null;
    }
    if (!paramIden.isReturns && paramIden.identifier.signature.paramsText.length === 0) {
      return displayMessage(`${paramIden.identifier.matchId} ${paramIden.identifier.name} has no parameters, remove the parenthesis`);
    }

    // For things like queues, manually handled - todo try to find better way
    paramIden = handleDynamicParams(paramIden);

    // Build the signature info
    const signature = paramIden.identifier.signature;
    const params = (paramIden.isReturns) ? signature.returnsText : signature.paramsText;
    const label = (paramIden.isReturns) ? `return (${params})` : `${paramIden.identifier.name}(${params})${signature.returnsText.length > 0 ? `: ${signature.returnsText}` : ''}`;
    const signatureInfo = new vscode.SignatureInformation(label);
    params.split(',').forEach(param => signatureInfo.parameters.push(new vscode.ParameterInformation(param.trim())));
    signatureInfo.activeParameter = paramIden.index;

    // Build the signature help
    const signatureHelp = new vscode.SignatureHelp();
    signatureHelp.signatures.push(signatureInfo);
    signatureHelp.activeSignature = 0;
    return signatureHelp;
  }
}

function handleDynamicParams(paramIdentifier) {
  if (paramIdentifier.dynamicCommand && paramIdentifier.identifier.signature.paramsText.length > 0) {
    const name = paramIdentifier.identifier.name;
    const command = get(paramIdentifier.dynamicCommand, matchType.COMMAND);
    if (command && command.signature.paramsText.length > 0) {
      let paramsText = `${command.signature.paramsText}, ${paramIdentifier.identifier.signature.paramsText}`;
      paramsText = `${name}${paramsText.substring(paramsText.indexOf(','))}`;
      return {index: paramIdentifier.index, identifier: {name: paramIdentifier.dynamicCommand, signature: {paramsText: paramsText, returnsText: ''}}};
    }
  }
  return paramIdentifier;
}

function displayMessage(message) {
  const signatureInfo = new vscode.SignatureInformation(message);
  const signatureHelp = new vscode.SignatureHelp();
  signatureHelp.signatures.push(signatureInfo);
  signatureHelp.activeSignature = 0;
  return signatureHelp;
}

module.exports = { provider, metadata };
