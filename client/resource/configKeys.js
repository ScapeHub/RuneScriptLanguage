// === STATIC CONFIG KEY MATCHES ===
const configKeys = {
  table: { params: [param('dbtable')] },
  huntmode: { params: [param('hunt')] },
  category: { params: [param('category')] },
  column: { params: [param('dbcolumn', true)] },
  walkanim: { params: [param('seq'), param('seq'), param('seq'), param('seq')] },
  multivarp: { params: [param('varp')] },
  multivarbit: { params: [param('varbit')] },
  certlink: { params: [param('obj')] },
  certtemplate: { params: [param('obj')] },
}

// === REGEX CONFIG KEY MATCHES ===
const regexConfigKeys = [
  { regex: /stock\d+/, params: [param('obj'), param('int'), param('int')], fileTypes: ["inv"] },
  { regex: /count\d+/, params: [param('obj'), param('int')], fileTypes: ["obj"] },
  { regex: /\w*anim\w*/, params: [param('seq')], fileTypes: ["loc", "npc", "if", "spotanim"] },
  { regex: /multiloc\d+/, params: [param('loc')], fileTypes: ["loc"] },
  { regex: /multinpc\d+/, params: [param('npc')], fileTypes: ["npc"]},
  { regex: /basevar/, params: [param('varp')], fileTypes: ["varbit"] },
  { regex: /basevar/, params: [param('varn')], fileTypes: ["varnbit"] },
  { regex: /script\d+op\d+=pushvar,/, params: [param('varp')], fileTypes: ["if"] },
  { regex: /layer/, params: [param('component')], fileTypes: ["if"] }
]

// === CONFIG KEYS THAT ARE HANDLED MANUALLY IN CONFIG_MATCHER ===
const specialCaseKeys = ['val', 'param', 'data', ''];

const specialCaseKeysRegex = [
  {regex: /script\d+op\d/, fileTypes: ["if"]}
]

function param(type, declaration = false) {
  return {typeId: type, declaration: declaration};
}

module.exports = { configKeys, regexConfigKeys, specialCaseKeys, specialCaseKeysRegex };
