var registerLoader = require('./register_loader');
var findCwd = require('./find_cwd');

function prepareConfig(self, env, opts) {
  var basedir = findCwd(opts);
  env.require.filter(toUnique).forEach(function(module) {
    self.requireLocal(module, basedir);
  });

  registerLoader(self, self.extensions, env.configPath, env.cwd);
}

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

module.exports = prepareConfig;
