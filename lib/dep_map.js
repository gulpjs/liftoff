const _ = require('lodash');
const findLocal = require('./find_local');

module.exports = function (deps, basedir) {
  deps = deps||[];
  return _.zipObject(deps, deps.map(function (dep) {
    return findLocal(dep, basedir);
  }));
};
