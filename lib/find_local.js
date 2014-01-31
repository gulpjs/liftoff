'use strict';

var resolve = require('resolve');

module.exports = function (module, basedir) {
  try {
    return resolve.sync(module, {basedir: basedir});
  } catch (e) {
    return null;
  }
};
