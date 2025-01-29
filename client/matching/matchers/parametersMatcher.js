const { getParamsIdentifier } = require('../../utils/paramMatchingUtils');

/**
 * Looks for matches of values inside of parenthesis
 * This includes return statement params, engine command parameters, proc parameters, label parameters, and queue parameters
 */ 
function parametersMatcher(context) {
  if (context.file.type !== 'rs2') {
    return null;
  }
  const paramsIdentifier = getParamsIdentifier(context);
  return (paramsIdentifier) ? paramsIdentifier.match : null;
}

module.exports = parametersMatcher;
