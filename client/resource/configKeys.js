const matchType = require("../matching/matchType");

// === STATIC CONFIG KEY MATCHES ===
const configKeys = {
  table: { match: matchType.DBTABLE },
  huntmode: { match: matchType.HUNT },
  category: { match: matchType.CATEGORY },
  column: { match: matchType.DBCOLUMN, declaration: true },
}

// === REGEX CONFIG KEY MATCHES ===
const regexConfigKeys = [
  { regex: /stock\d+/, match: matchType.OBJ, fileTypes: ["inv"] },
  { regex: /\w*anim\w*/, match: matchType.SEQ, fileTypes: ["loc", "npc", "if", "spotanim"] },
]

module.exports = { configKeys, regexConfigKeys };
