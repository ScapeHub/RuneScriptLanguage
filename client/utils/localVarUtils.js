const findLocalVar = (fileText, word) => {
  const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const matches = [...fileText.matchAll(new RegExp(`${varKeyword} \\$${word}(,|;|=|\\)| ){1}`, "g"))];
  return matches[matches.length - 1];
}

module.exports = { findLocalVar };
