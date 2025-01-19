const identifierUtils = require('../utils/identifierUtils');

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
  return identifierCache[resolveKey(name, match)] !== undefined;
}

function get(name, match) {
  return identifierCache[resolveKey(name, match)];
}

function put(name, match, identifier) {
  const key = resolveKey(name, match);
  const fileKey = resolveFileKey(identifier.declaration.uri);
  if (!key || !fileKey) {
    return null;
  }
  let curIdentifier = identifierCache[key];
  if (curIdentifier && curIdentifier.declaration) {
    return null; // declaration already exists, don't overwrite, if it needs to be updated it should be deleted first
  }
  if (curIdentifier && !curIdentifier.declaration) {
    identifier.references = curIdentifier.references;
  } 
  addToFileMap(fileKey, key);
  identifierCache[key] = identifier;
}

function putReference(name, match, uri, lineNum, index) {
  const key = resolveKey(name, match)
  const fileKey = resolveFileKey(uri);
  if (!key || !fileKey) {
    return null;
  }
  if (!identifierCache[key]) {
    identifierCache[key] = {references: {}};
  } 
  const fileReferences = identifierCache[key].references[fileKey] || new Set();
  fileReferences.add(identifierUtils.endcodeReference(lineNum, index));
  addToFileMap(fileKey, key, false);
  identifierCache[key].references[fileKey] = fileReferences;
}

function clear() {
  identifierCache = {};
  fileToIdentifierMap = {};
}

function clearFile(uri) {
  const fileKey = resolveFileKey(uri);
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

function resolveKey(name, match) {
  return (!name || !match) ? null : name + match.id;
}

function resolveFileKey(uri) {
  return (uri) ? uri.path : null;
}

function addToFileMap(fileKey, identifierKey, declaration=true) {
  const identifiersInFile = fileToIdentifierMap[fileKey] || { declarations: new Set(), references: new Set() };
  (declaration) ? identifiersInFile.declarations.add(identifierKey) : identifiersInFile.references.add(identifierKey);
  fileToIdentifierMap[fileKey] = identifiersInFile;
}

module.exports = { contains, get, put, putReference, clear, clearFile };
