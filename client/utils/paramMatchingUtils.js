const matchType = require('../matching/matchType');
const identifierCache = require('../cache/identifierCache');
const returnBlockLinesCache = require('../cache/returnBlockLinesCache');
const { getWordAtIndex, reference } = require('./matchUtils');

function getParamsIdentifier(context) {
  const { identifierName, paramIndex } = parseForIdentifierNameAndParamIndex(context.line.text, context.lineIndex, context.words);
  if (!identifierName) {
    return null;
  }
  const name = identifierName.value;
  const prev = context.line.text.charAt(identifierName.start - 1);

  if (name === 'return') {
    const blockIdentifierKey = returnBlockLinesCache.get(context.line.number, context.uri);
    if (blockIdentifierKey) {
      const iden = identifierCache.getByKey(blockIdentifierKey);
      if (iden && iden.signature && iden.signature.returns.length > paramIndex) {
        return {identifier: iden, index: paramIndex, match: reference(matchType[iden.signature.returns[paramIndex]]), isReturns: true};
      }
    }
    return null;
  } 
  
  let iden;
  let indexOffset = 0;
  let dynamicCommand;
  if (name === 'queue') {
    indexOffset = 2;
    if (paramIndex < indexOffset) {
      iden = identifierCache.get(name, matchType.COMMAND);
      indexOffset = 0;
    } else {
      const queueName = getWordAtIndex(context.words, identifierName.end + 2);
      iden = (queueName) ? identifierCache.get(queueName.value, matchType.QUEUE) : null;
      dynamicCommand = name;
    }
  } else if (name === 'longqueue') {
    indexOffset = 3;
    if (paramIndex < indexOffset) {
      iden = identifierCache.get(name, matchType.COMMAND);
      indexOffset = 0;
    } else {
      const queueName = getWordAtIndex(context.words, identifierName.end + 2);
      iden = (queueName) ? identifierCache.get(queueName.value, matchType.QUEUE) : null;
      dynamicCommand = name;
    }
  } else if (prev === '@') {
    iden = identifierCache.get(name, matchType.LABEL);
  } else if (prev === '~') {
    iden = identifierCache.get(name, matchType.PROC);
  } else {
    iden = identifierCache.get(name, matchType.COMMAND);
  }
  if (iden && iden.signature && iden.signature.params.length > (paramIndex - indexOffset)) {
    return {identifier: iden, index: paramIndex, match: reference(matchType[iden.signature.params[(paramIndex - indexOffset)].matchTypeId]), isReturns: false, dynamicCommand: dynamicCommand};
  }
  return null;
}

function parseForIdentifierNameAndParamIndex(lineText, index, words) {
  let isInString = determineInString(lineText, index);
  let isInParams = 0;
  let paramIndex = 0;
  for (let i = index; i >= 0; i--) {
    const char = lineText.charAt(i);
    if (isInString) {
      if (char === '"' && i > 0 && lineText.charAt(i - 1) !== '\\') isInString = false;
      continue;
    }
    else if (char === '"' && i > 0 && lineText.charAt(i - 1) !== '\\') {
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
      return {identifierName: getWordAtIndex(words, i - 2), paramIndex: paramIndex};
    }
  }
  return {identifierName: null, paramIndex: null};
}

function determineInString(lineText, index) {
  let quoteCount = 0;
  for (let i = index; i < lineText.length; i++) {
    if (lineText.charAt(i) === '"' && i > 0 && lineText.charAt(i - 1) !== '\\') {
      quoteCount++;
    }
  }
  return quoteCount % 2 === 1;
}

module.exports = { getParamsIdentifier };