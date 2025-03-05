const cs1Commands = [
    'stat_level',
    'stat_base_level',
    'stat_xp',
    'inv_count',
    'pushvar',
    'stat_xp_remaining',
    'var_percent',
    'combat_level',
    'stat_total',
    'inv_contains',
    'runenergy',
    'runweight',
    'testbit',
    'pushvarbit',
    'sub',
    'divide',
    'multiply',
    'coordx',
    'coordz',
    'pushint'
];

const cs1VarCommands = [
    'pushvar',
    'pushvarbit',
    'var_percent',
    'testbit'
];

const cs1StatCommands = [
    'stat_level',
    'stat_base_level',
    'stat_xp',
    'stat_xp_remaining',
    'stat_total'
];

const cs1InvCommands = [
    'inv_count',
    'inv_contains'
];

module.exports = {
    cs1Commands,
    cs1VarCommands,
    cs1StatCommands,
    cs1InvCommands
};