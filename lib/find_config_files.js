'use strict';

var isPlainObject = require('is-plain-object');
var mapValues = require('object.map');
var fined = require('fined');
var registerLoader = require('./register_loader');

var notFound = { path: null };

function findConfigFiles(configFiles, cwd, extensions, eventEmitter) {
  if (!isPlainObject(configFiles)) {
    return {};
  }

  return mapValues(configFiles, function(prop, name) {
    var defaultObj = { name: name, cwd: cwd, extensions: extensions };
    return mapValues(prop, function(pathObj) {
      var found = fined(pathObj, defaultObj) || notFound;
      if (isPlainObject(found.extension)) {
        registerLoader(eventEmitter, found.extension, found.path, cwd);
      }
      return found.path;
    });
  });
}

module.exports = findConfigFiles;
