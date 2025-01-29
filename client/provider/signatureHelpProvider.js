const vscode = require('vscode');
const { getBaseContext } = require('../utils/matchUtils');
const { getParamsIdentifier } = require('../utils/paramMatchingUtils');
const matchType = require('../matching/matchType');
const { get } = require('../cache/identifierCache');

const metadata = {
  triggerCharacters: ['(', ','], 
  retriggerCharacters: [',']
}

const provider = (extensionContext) => {
  return {
    provideSignatureHelp(document, position) {
      // Get parameter identifier
      let str = document.lineAt(position.line).text;
      str = str.substring(0, position.character) + 'temp' + str.substring(position.character);
      const matchContext = getBaseContext(str, position.line, document.uri);
      matchContext.lineIndex = position.character + 1;
      var paramIdentifier = getParamsIdentifier(matchContext);
      if (!paramIdentifier) {
        return null;
      }

      // For things like queues, manually handled - todo try to find better way
      paramIdentifier = handleDynamicParams(paramIdentifier);

      // Build the signature info
      let label = `${paramIdentifier.identifier.name}(${paramIdentifier.identifier.signature.paramsText})`;
      if (paramIdentifier.identifier.signature.returnsText.length > 0) {
        label += `: ${paramIdentifier.identifier.signature.returnsText}`;
      }
      const signatureInfo = new vscode.SignatureInformation(label);
      paramIdentifier.identifier.signature.paramsText.split(',').forEach(param => {
        signatureInfo.parameters.push(new vscode.ParameterInformation(param.trim()));
      })
      signatureInfo.activeParameter = paramIdentifier.index;

      // Build the signature help
      const signatureHelp = new vscode.SignatureHelp();
      signatureHelp.signatures.push(signatureInfo);
      signatureHelp.activeSignature = 0;
      signatureHelp.activeParameter = paramIdentifier.index;
      return signatureHelp;
    }
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

module.exports = { provider, metadata };
