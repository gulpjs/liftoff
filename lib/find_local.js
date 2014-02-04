const resolve = require('resolve');

module.exports = function (module, basedir) {
  return resolve.sync(module, {basedir: basedir});
};
