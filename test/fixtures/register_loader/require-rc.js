(function() {

var path = require('path');

require.extensions['.rc'] = function(module, filepath) {
  module.loaded = true;
  module.exports = 'Load ' + path.basename(filepath) + ' by require-rc';
};

}());
