const identifierCache = require("../../cache/identifierCache");
const matchType = require("../matchType");
const { reference, declaration } = require("../../utils/matchUtils");

/**
 * Looks for matches of known engine commands
 */ 
function commandMatcher(context) {
  if (identifierCache.contains(context.word.value, matchType.COMMAND) && context.prevChar !== '[') {
    return (context.uri.path.includes("engine.rs2")) ? declaration(matchType.COMMAND) : reference(matchType.COMMAND);
  }
}

module.exports = commandMatcher;
