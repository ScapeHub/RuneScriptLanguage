const cacheUtils = require('../utils/cacheUtils');

/**
 * The identifierCache stores all matched identifiers in the workspace
 * identifierCache = {key [name+matchTypeId]: identifier}
 * See identifierFactory.js for the object structure
 */
var identifierCache = {};

/**
 * The fileToIdentiferMap keeps track of all identifiers and references in a file
 * This is used for updating the cache as necessary when a file is modified
 * fileToIdentiferMap = {filePath: {declarations: Set(), references: Set()}}
 */
var fileToIdentifierMap = {};

function contains(name, match) {
  return identifierCache[cacheUtils.resolveKey(name, match)] !== undefined;
}

function get(name, match) {
  return identifierCache[cacheUtils.resolveKey(name, match)];
}

function getByKey(key) {
  return identifierCache[key];
}

function put(name, match, identifier) {
  const key = cacheUtils.resolveKey(name, match);
  const fileKey = cacheUtils.resolveFileKey(identifier.declaration.uri);
  if (!key || !fileKey) {
    return null;
  }
  let curIdentifier = identifierCache[key];
  if (curIdentifier && curIdentifier.declaration) {
    return null; // declaration already exists, don't overwrite, if it needs to be updated it should be deleted first
  }
  if (curIdentifier) {
    if (curIdentifier.id) identifier.id = curIdentifier.id;
    if (!curIdentifier.declaration) identifier.references = curIdentifier.references;
  }
  addToFileMap(fileKey, key);
  identifierCache[key] = identifier;
}

function putReference(name, match, uri, lineNum, index, packId) {
  const key = cacheUtils.resolveKey(name, match)
  const fileKey = cacheUtils.resolveFileKey(uri);
  if (!key || !fileKey) {
    return null;
  }
  if (!identifierCache[key]) {
    identifierCache[key] = {references: {}};
  } 
  const fileReferences = identifierCache[key].references[fileKey] || new Set();
  fileReferences.add(cacheUtils.encodeReference(lineNum, index));
  addToFileMap(fileKey, key, false);
  identifierCache[key].references[fileKey] = fileReferences;
  if (packId) identifierCache[key].id = packId;
}

function clear() {
  identifierCache = {};
  fileToIdentifierMap = {};
}

function clearFile(uri) {
  const fileKey = cacheUtils.resolveFileKey(uri);
  const identifiersInFile = fileToIdentifierMap[fileKey] || { declarations: new Set(), references: new Set() };
  identifiersInFile.references.forEach(key => {
    if (identifierCache[key] && identifierCache[key].references[fileKey]) {
      delete identifierCache[key].references[fileKey];
    }
  })
  identifiersInFile.declarations.forEach(key => {
    const orphanedReferences = identifierCache[key].references;
    if (identifierCache[key]) {
      delete identifierCache[key];
    }
    identifierCache[key] = {references: orphanedReferences};
  });
  delete fileToIdentifierMap[fileKey];
}

function addToFileMap(fileKey, identifierKey, declaration=true) {
  const identifiersInFile = fileToIdentifierMap[fileKey] || { declarations: new Set(), references: new Set() };
  (declaration) ? identifiersInFile.declarations.add(identifierKey) : identifiersInFile.references.add(identifierKey);
  fileToIdentifierMap[fileKey] = identifiersInFile;
}

module.exports = { contains, get, getByKey, put, putReference, clear, clearFile };
