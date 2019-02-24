(function() {

var path = require('path');

require.extensions['.conf'] = function(module, filepath) {
  module.loaded = true;
  module.exports = 'Load ' + path.basename(filepath) + ' by require-conf';
};

}());
