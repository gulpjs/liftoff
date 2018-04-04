const sortBy = require('array-sort');
const isPlainObject = require('is-plain-object');
const mapValues = require('object.map');
const fined = require('fined');

const registerLoader = require('./register_loader');

const notFound = { path: null };

function processConfigFiles(configFiles, defaults, emitter) {
  if (!isPlainObject(configFiles)) {
    return {};
  }

  return mapValues(configFiles, function(propObj, propName) {
    var defaultObj = {
      name: propName,
      cwd: defaults.cwd,
      extensions: defaults.extensions,
    };

    return sortBy(objectToArray(propObj), 'value.order')
      .reduce(function(rtnObj, elem) {
        var pathName = elem.key;
        var pathObj = elem.value;

        var found = fined(pathObj, defaultObj) || notFound;
        if (isPlainObject(found.extension)) {
          registerLoader(emitter, found.extension, found.path, defaults.cwd);
        }

        if (found.path && typeof pathObj.onFound === 'function') {
          pathObj.onFound.call(emitter, pathName, found.path);
        }

        rtnObj[pathName] = found.path;
        return rtnObj;
      }, {});
  });
}

function objectToArray(obj) {
  return Object.keys(obj).map(function(key) {
    return { key: key, value: obj[key] };
  });
}

module.exports = processConfigFiles;
