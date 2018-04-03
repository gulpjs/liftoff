const registerLoader = require('./register_loader');
const findCwd = require('./find_cwd');

function prepareConfig(env, opts) {
  const self = this;

  const basedir = findCwd(opts);
  env.require.filter(toUnique).forEach(function(module) {
    self.requireLocal(module, basedir);
  });

  registerLoader(self, self.extensions, env.configPath, env.cwd);
}

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

module.exports = prepareConfig;
