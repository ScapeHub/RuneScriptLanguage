const postProcessors = require('../resource/postProcessors');
const { VALUE, SIGNATURE, CODEBLOCK, TITLE, INFO } = require("../enum/hoverDisplayItems");
const { DECLARATION_HOVER_ITEMS, REFERENCE_HOVER_ITEMS, LANGUAGE, BLOCK_SKIP_LINES, CONFIG_INCLUSIONS } = require('../enum/hoverConfigOptions');

/* 
Match types define the possible types of identifiers that can be found. The config for a match type tells the extension 
all the necessary data it needs for finding declarations, building hover texts, and finding references.
{
  id: String - the unique id for the matchType,
  types: String[] - the type keywords which map to this matchType, for example: [namedobj, obj] for OBJ
  fileTypes: String[] - the possible file types this matchType can be declared in
  cache: boolean - whether or not identifiers with this matchType should be cached
  hoverConfig: Object - Config options to modify the hover display for this matchType, options in hoverConfig.js
  postProcessor: Function(identifier) - An optional post processing function to apply for this matchType, see postProcessors.js
  hoverOnly: boolean - if true, this match type is only used for hover displays
  noop: boolean - if true, nothing is done with this match type (but still useful for terminating word searching early)
}
*/
const matchType = {
  LOCAL_VAR: {
    id: 'LOCAL_VAR', types: [], fileTypes: ['rs2'], cache: false,
  },
  GLOBAL_VAR: {
    id: 'GLOBAL_VAR', types: [], fileTypes: ['varp', 'vars', 'varn'], cache: true, 
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'varpconfig'},
  },
  CONSTANT: {
    id: 'CONSTANT', types: [], fileTypes: ['constant'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'constants', [BLOCK_SKIP_LINES]: 0},
  },
  LABEL: {
    id: 'LABEL', types: ['label'], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
  },
  PROC: {
    id: 'PROC', types: ['proc'], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
  },
  TIMER: {
    id: 'TIMER', types: ['timer'], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
  },
  SOFTTIMER: {
    id: 'SOFTTIMER', types: ['softtimer'], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
  },
  QUEUE: {
    id: 'QUEUE', types: ['queue'], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
    postProcessor: postProcessors.queuePostProcessor
  },
  SEQ: {
    id: 'SEQ', types: ['seq'], fileTypes: ['seq'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO], [LANGUAGE]: 'seqconfig'},
  },
  SPOTANIM: {
    id: 'SPOTANIM', types: ['spotanim'], fileTypes: ['spotanim'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO], [LANGUAGE]: 'spotanimconfig'},
  },
  HUNT: {
    id: 'HUNT', types: ['hunt'], fileTypes: ['hunt'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'huntconfig', [CONFIG_INCLUSIONS]: ['type']},
  },
  LOC: {
    id: 'LOC', types: ['loc'], fileTypes: ['loc'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'locconfig', [CONFIG_INCLUSIONS]: ['name', 'desc', 'category']},
  },
  NPC: {
    id: 'NPC', types: ['npc'], fileTypes: ['npc'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'npcconfig', [CONFIG_INCLUSIONS]: ['name', 'desc', 'category']},
  },
  OBJ: {
    id: 'OBJ', types: ['namedobj', 'obj'], fileTypes: ['obj'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'objconfig', [CONFIG_INCLUSIONS]: ['name', 'desc', 'category']},
  },
  INV: {
    id: 'INV', types: ['inv'], fileTypes: ['inv'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'invconfig'},
  },
  ENUM: {
    id: 'ENUM', types: ['enum'], fileTypes: ['enum'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'enumconfig', [CONFIG_INCLUSIONS]: ['inputtype', 'outputtype']},
    postProcessor: postProcessors.enumPostProcessor
  },
  DBCOLUMN: {
    id: 'DBCOLUMN', types: ['dbcolumn'], fileTypes: ['dbrow'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'dbrowconfig'},
  },
  DBROW: {
    id: 'DBROW', types: ['dbrow'], fileTypes: ['dbrow'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'dbrowconfig'},
  },
  DBTABLE: {
    id: 'DBTABLE', types: ['dbtable'], fileTypes: ['dbtable'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'dbtableconfig'},
  },
  INTERFACE: {
    id: 'INTERFACE', types: ['interface'], fileTypes: ['if'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE], [LANGUAGE]: 'interface'},
  },
  COMPONENT: {
    id: 'COMPONENT', types: ['component'], fileTypes: ['if'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, INFO], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO], [LANGUAGE]: 'interface'},
    postProcessor: postProcessors.componentPostProcessor
  },
  PARAM: {
    id: 'PARAM', types: ['param'], fileTypes: ['param'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'paramconfig'},
    postProcessor: postProcessors.paramPostProcessor
  },
  COMMAND: {
    id: 'COMMAND', types: [], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
  },
  SYNTH: {
    id: 'SOUND_SYNTH', types: ['synth'], fileTypes: [], cache: true,
    hoverConfig: {[REFERENCE_HOVER_ITEMS]: [TITLE]},
  },
  WALKTRIGGER: {
    id: 'WALKTRIGGER', types: ['walktrigger'], fileTypes: ['rs2'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, SIGNATURE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, SIGNATURE]},
  },
  IDK: {
    id: 'IDK', types: ['idk', 'idkit'], fileTypes: ['idk'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO, CODEBLOCK], [LANGUAGE]: 'idkconfig'},
  },
  MESANIM: {
    id: 'MESANIM', types: ['mesanim'], fileTypes: ['mesanim'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO], [LANGUAGE]: 'mesanimconfig'},
  },
  STRUCT: {
    id: 'STRUCT', types: ['struct'], fileTypes: ['struct'], cache: true,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE], [REFERENCE_HOVER_ITEMS]: [TITLE, INFO], [LANGUAGE]: 'structconfig'},
  },
  // Hover only match types that are only used for displaying hover displays (no finding references/declarations)
  // Useful for terminating word searches early when detected. Postprocessing can be done on these.
  // Specify referenceConfig to select which displayItems should be shown on hover.
  COORDINATES: {
    id: 'COORDINATES', types: [], hoverOnly: true, cache: false,
    hoverConfig: {[REFERENCE_HOVER_ITEMS]: [TITLE, VALUE]},
    postProcessor: postProcessors.coordPostProcessor
  },
  CONFIG_KEY: {
    id: 'CONFIG_KEY', types: [], hoverOnly: true, cache: false,
    hoverConfig: {[REFERENCE_HOVER_ITEMS]: [TITLE, INFO]},
    postProcessor: postProcessors.configKeyPostProcessor
  },
  TRIGGER: {
    id: 'TRIGGER', types: [], hoverOnly: true, cache: false,
    hoverConfig: {[REFERENCE_HOVER_ITEMS]: [TITLE, INFO]},
    postProcessor: postProcessors.triggerPostProcessor
  },
  STAT: { 
    id: 'STAT', types: ['stat'], hoverOnly: true, cache: false,
    hoverConfig: {[REFERENCE_HOVER_ITEMS]: [TITLE]},
  },
  CATEGORY_TRIGGER: {
    id: 'CATEGORY_TRIGGER', types: [], hoverOnly: true, cache: false,
    hoverConfig: {[DECLARATION_HOVER_ITEMS]: [TITLE, VALUE]},
    postProcessor: postProcessors.categoryTriggerPostProcessor
  },
  // NOOP Match types that might get detected, but nothing is done with them (no hover display, no finding references/declarations)
  // Useful for terminating word searching early when detected, and possibly doing something with them at a later date
  UNKNOWN: { id: 'UNKNOWN', noop: true, cache: false }, // default to map to when a value is matched but no specific matchType for it
  COLOR: { id: 'COLOR', noop: true, cache: false },
  NUMBER: { id: 'NUMBER', noop: true, cache: false }
};

module.exports = matchType;
