const Trie = require('./class/Trie');

/**
 * One trie per matchType, stores the names of all identifiers of a matchtype in a trie datastructure
 * This is used for quicker code completion lookups
 */
var completionCache = {};

function put(name, matchTypeId) {
  if (!completionCache[matchTypeId]) {
    completionCache[matchTypeId] = new Trie();
  }
  completionCache[matchTypeId].insert(name);
}

function getAllWithPrefix(prefix, matchTypeId) {
  const matchTrie = completionCache[matchTypeId];
  if (matchTrie) {
    return matchTrie.findAllWithPrefix(prefix);
  }
  return null;
}

function remove(name, matchTypeId) {
  const matchTrie = completionCache[matchTypeId];
  if (matchTrie) {
    matchTrie.removeWord(name);
  }
}

function clear(matchTypeId) {
  if (matchTypeId) {
    delete completionCache[matchTypeId];
  } else {
    completionCache = {};
  }
}

function getTypes() {
  return Object.keys(completionCache);
}

module.exports = { put, getAllWithPrefix, getTypes, remove, clear };