const { reference } = require("../../utils/matchUtils");
const dataTypeToMatchId = require("../../resource/dataTypeToMatchId");
const matchType = require("../matchType");

/**
 * Looks for matches in pack files
 */ 
function packMatcher(context) {
  if (context.file.type === 'pack' && context.word.index === 1) {
    return reference(matchType[dataTypeToMatchId(context.file.name)]);
  }
}

module.exports = packMatcher;
