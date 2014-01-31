'use strict';

var path = require('path');

module.exports = function (base) {
  if (base) {
    return path.resolve(base);
  } else {
    return process.cwd();
  }
};
