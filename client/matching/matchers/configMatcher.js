const { CONFIG_LINE, CONFIG_DECLARATION } = require("../../enum/regex");
const { configKeys, regexConfigKeys } = require("../../resource/configKeys");
const dataTypeToMatchId = require("../../resource/dataTypeToMatchId");
const matchType = require("../matchType");
const identifierCache = require("../../cache/identifierCache");
const { reference, declaration, getWordAtIndex } = require("../../utils/matchUtils");

const specialCaseCommandKeys = ['val', 'param'];
const enumValMinimumIndex = 4; // val=

/**
 * Looks for matches on config files, both config declarations and config line items
 */
function configMatcher(context) {
  // Check for config file declarations (i.e. declarations with [NAME])
  if (CONFIG_DECLARATION.test(context.line.text)) {
    return declarationMatcher(context);
  }

  // Check if the line we are matching is a config line
  if (CONFIG_LINE.test(context.line.text)) {
    const configKey = context.words[0].value;
    // The config key itsself is selected, so check if it is a known config key or not (config key with info)
    if (context.word.index === 0) {
      return reference(matchType.CONFIG_KEY);
    }
    // Check for special cases that need to be manually handled
    if (specialCaseCommandKeys.includes(configKey)) {
      return handleSpecialCases(configKey, context);
    }
    // Otherwise, if the second word is the selected word (word after '=') then handle remaining known keys/regex keys
    if (context.word.index >= 1) {
      const configMatch = configKeys[configKey];
      return (configMatch) ? reference(configMatch.match) : checkRegexConfigKeys(configKey, context);
    }
  }
}

function declarationMatcher(context) {
  switch (context.file.type) {
    case "varp": case "varn": case "vars": return declaration(matchType.GLOBAL_VAR);
    case "obj": return declaration(matchType.OBJ);
    case "loc": return declaration(matchType.LOC);
    case "npc": return declaration(matchType.NPC);
    case "param": return declaration(matchType.PARAM);
    case "seq": return declaration(matchType.SEQ);
    case "struct": return declaration(matchType.STRUCT);
    case "dbrow": return declaration(matchType.DBROW);
    case "dbtable": return declaration(matchType.DBTABLE);
    case "enum": return declaration(matchType.ENUM);
    case "hunt": return declaration(matchType.HUNT);
    case "inv": return declaration(matchType.INV);
    case "spotanim": return declaration(matchType.SPOTANIM);
    case "idk": return declaration(matchType.IDK);
    case "mesanim": return declaration(matchType.MESANIM);
    case "if": return declaration(matchType.COMPONENT)
  }
}

function checkRegexConfigKeys(configKey, context) {
  for (let regexKey of regexConfigKeys) {
    if (regexKey.fileTypes.includes(context.file.type) && regexKey.regex.test(configKey)) {
      return reference(regexKey.match);
    }
  }
  return null;
}

function handleSpecialCases(key, context) {
  switch (key) {
    case 'param': return paramSpecialCase(context);
    case 'val': return valSpecialCase(context);
  }
}

function paramSpecialCase(context) {
  if (context.word.index === 1) return reference(matchType.PARAM);
  if (context.word.index === 2) {
    const paramIdentifier = identifierCache.get(context.words[1].value, matchType.PARAM);
    if (paramIdentifier && paramIdentifier.extraData) {
      return reference(matchType[dataTypeToMatchId(paramIdentifier.extraData.dataType)]);
    }
  }
  return matchType.UNKNOWN;
}

function valSpecialCase(context) {
  const enumIdentifier = identifierCache.getParentDeclaration(context.uri, context.line.number);
  if (context.lineIndex >= enumValMinimumIndex) {
    const commaIndex = context.line.text.indexOf(',');
    if (context.lineIndex < commaIndex) return reference(matchType[dataTypeToMatchId(enumIdentifier.extraData.inputType)]);
    if (context.lineIndex > commaIndex) return reference(matchType[dataTypeToMatchId(enumIdentifier.extraData.outputType)]);
  }
  return matchType.UNKNOWN; 
}

module.exports = configMatcher;
