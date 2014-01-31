'use strict';

module.exports = function () {
  var extensions;
  if (require.extensions) {
    extensions = Object.keys(require.extensions).join(',');
  } else {
    extensions = ['.js'];
  }
  return extensions;
};
