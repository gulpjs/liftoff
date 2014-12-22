const fs = require('fs');
const path = require('path');
const fileSearch = require('./file_search');

module.exports = function (opts) {
  opts = opts || {};
  var configNameSearch = opts.configNameSearch;
  var searchPaths = opts.searchPaths;
  if (!Array.isArray(searchPaths)) {
    throw new Error('Please provide an array of paths to search for config in.');
  }
  if (!configNameSearch) {
    throw new Error('Please provide a configNameSearch.');
  }
  var configPath = fileSearch(configNameSearch, searchPaths);
  // confirm the configPath exists and return an absolute path to it
  if (fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};
