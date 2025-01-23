const matchType = require('../matchType');
const identifierCache = require('../../cache/identifierCache');
const { reference, getWordAtIndex } = require("../../utils/matchUtils");
const returnBlockLinesCache = require('../../cache/returnBlockLinesCache');

/**
 * Looks for matches of values inside of parenthesis
 * This includes return statement params, engine command parameters, proc parameters, label parameters, and queue parameters
 */ 
function parametersMatcher(context) {
  if (context.file.type !== 'rs2') {
    return null;
  }
  const { identifierName, paramIndex } = parseForIdentifierNameAndParamIndex(context);
  if (!identifierName) {
    return null;
  }
  const name = identifierName.value;
  const prev = context.line.text.charAt(identifierName.start - 1);
  let identifier;
  if (name === 'return') {
    const blockIdentifierKey = returnBlockLinesCache.get(context.line.number, context.uri);
    if (blockIdentifierKey) {
      identifier = identifierCache.getByKey(blockIdentifierKey);
      if (identifier && identifier.signature.returns.length > paramIndex) {
        return reference(matchType[identifier.signature.returns[paramIndex]]);
      }
    }
    return matchType.UNKNOWN;
  } else if (name === 'queue') {
    if (paramIndex === 0) return reference(matchType.QUEUE);
    if (paramIndex === 1) return matchType.UNKNOWN;
    const queueName = getWordAtIndex(context.words, identifierName.end + 2);
    if (!queueName) return matchType.UNKNOWN;
    identifier = identifierCache.get(queueName.value, matchType.QUEUE);
  } else if (prev === '@') {
    identifier = identifierCache.get(name, matchType.LABEL);
  } else if (prev === '~') {
    identifier = identifierCache.get(name, matchType.PROC);
  } else {
    identifier = identifierCache.get(name, matchType.COMMAND);
  }
  if (!identifier || !identifier.signature || identifier.signature.params.length <= paramIndex) {
    return null;
  }
  return reference(matchType[identifier.signature.params[paramIndex].matchTypeId]);
}

function parseForIdentifierNameAndParamIndex(context) {
  const str = context.line.text;
  let isInString = false;
  let isInParams = 0;
  let paramIndex = 0;
  for (let i = context.lineIndex; i >= 0; i--) {
    const char = str.charAt(i);
    if (isInString) {
      if (char === '"') isInString = false;
      continue;
    }
    else if (char === '"') {
      isInString = true;
      continue;
    }

    if (char === ')') {
      isInParams++;
      continue;
    }
    if (isInParams > 0) {
      if (char === '(') isInParams--;
      continue;
    }

    if (char === ',') {
      paramIndex++;
    } else if (char === '(') {
      return {identifierName: getWordAtIndex(context.words, i - 2), paramIndex: paramIndex};
    }
  }
  return {identifierName: null, paramIndex: null};
}

module.exports = parametersMatcher;
