const _ = require('lodash');
const util = require('util');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const findup = require('findup-sync');
const depMap = require('./lib/dep_map');
const findCwd = require('./lib/find_cwd');
const findLocal = require('./lib/find_local');
const validExtensions = require('./lib/valid_extensions');

function Liftoff (opts) {
  opts = opts||{};
  var defaults = {
    cwdOpt: 'cwd',
    preloadOpt: 'require',
    localDeps: []
  };
  if(opts.name) {
    if (!opts.processTitle) {
      opts.processTitle = opts.name;
    }
    if(!opts.configName) {
      opts.configName = opts.name+'file';
    }
    if(!opts.localDeps) {
      opts.localDeps = [opts.name];
    }
  }
  if(!opts.processTitle) {
    throw new Error('You must specify a processTitle.');
  }
  if(!opts.configName) {
    throw new Error('You must specify a configName.');
  }
  if(!Array.isArray(opts.localDeps)) {
    throw new Error('localDeps must be an array.');
  }
  _.extend(this, defaults, opts);
}
util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function (module, basedir) {
  try {
    var result = require(findLocal(module, basedir));
    this.emit('require', module, result);
    return result;
  } catch (e) {
    this.emit('requireFail', module, e);
  }
};

Liftoff.prototype.launch = function (fn, args) {
  if(typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  if(!args) {
    args = require('optimist').argv;
  }
  process.title = this.processTitle;

  // build an environment
  var env = {
    settings: this,
    args: args,
    cwd: findCwd(args[this.cwdOpt]),
    preload: [],
    validExtensions: null,
    configNameRegex: null,
    configPath: null,
    configBase: null,
    localPackage: null,
    depMap: []
  };

  // preload any modules requested
  var deps = args[this.preloadOpt]||[];
  _.flatten([deps]).forEach(function (dep) {
    this.requireLocal(dep, env.cwd);
  }, this);

  // find the config file
  env.validExtensions = validExtensions();
  env.configNameRegex = this.configName+'{'+env.validExtensions.join(',')+'}';
  env.configPath = findup(env.configNameRegex, {cwd: env.cwd, nocase: true});

  // finish populating environment if a config was found
  if(env.configPath) {
    env.configBase = path.dirname(env.configPath);
    // attempt to load local package.json
    try {
      env.localPackage = require(findup('package.json', {cwd: env.configBase}));
    } catch (e) {}
    // map all dependencies to their local location
    env.depMap = depMap(this.localDeps, env.cwd);
  }
  fn.apply(env);
};

module.exports = Liftoff;
