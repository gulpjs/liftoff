var fs = require('fs');
var path = require('path');
var fileSearch = require('./file_search');

module.exports = function (opts) {
  opts = opts || {};
  var configNameSearch = opts.configNameSearch;
  var configPath = opts.configPath;
  var searchPaths = opts.searchPaths;
  // only search for a config if a path to one wasn't explicitly provided
  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error(
        'Please provide an array of paths to search for config in.'
      );
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }
  // confirm the configPath exists and return an absolute path to it
  // Skip the call to fs.existsSync if configPath is null
  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};
