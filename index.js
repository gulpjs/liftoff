const util = require('util');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const extend = require('extend');
const findup = require('findup-sync');
const findCwd = require('./lib/find_cwd');
const findLocal = require('./lib/find_local');
const validExtensions = require('./lib/valid_extensions');

function Liftoff (opts) {
  opts = opts||{};
  var defaults = {
    cwdFlag: 'cwd',
    addExtensions: [],
    preloadFlag: 'require',
    completionFlag: 'completion',
    completions: null
  };
  if(opts.name) {
    if (!opts.processTitle) {
      opts.processTitle = opts.name;
    }
    if(!opts.configName) {
      opts.configName = opts.name+'file';
    }
    if(!opts.moduleName) {
      opts.moduleName = opts.name;
    }
  }
  if(!opts.processTitle) {
    throw new Error('You must specify a processTitle.');
  }
  if(!opts.configName) {
    throw new Error('You must specify a configName.');
  }
  if(!opts.moduleName) {
    throw new Error('You must specify a moduleName.');
  }
  if(!opts.configLocationFlag) {
    this.configLocationFlag = opts.configName;
  }
  extend(this, defaults, opts);
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

Liftoff.prototype.launch = function (fn, argv) {
  if(typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }
  if(!argv) {
    argv = require('minimist')(process.argv.slice(2));
  }
  process.title = this.processTitle;

  // parse command line options
  var cwd = argv[this.cwdFlag];
  var configLocation = argv[this.configLocationFlag];
  var preload = argv[this.preloadFlag]||[];
  var completion = argv[this.completionFlag];

  // run completions, if any available
  if (completion && this.completions) {
    return this.completions(completion);
  }

  // ensure preloads is an array
  if(!Array.isArray(preload)) {
    preload = [preload];
  }

  // if direct location of configFile has been specified,
  // use the folder it is located in as the cwd
  if(configLocation) {
    cwd = path.dirname(configLocation);
  }

  // build an environment
  var env = {
    settings: this,
    argv: argv,
    cwd: findCwd(cwd),
    preload: preload,
    validExtensions: null,
    configNameRegex: null,
    configPath: null,
    configBase: null,
    modulePackage: null,
    modulePath: null
  };

  // preload any required modules
  preload.forEach(function (dep) {
    this.requireLocal(dep, env.cwd);
  }, this);

  // find the config file
  env.validExtensions = validExtensions(this.addExtensions);
  if(this.configName instanceof RegExp) {
    env.configNameRegex = this.configName;
  } else {
    env.configNameRegex = this.configName+'{'+env.validExtensions.join(',')+'}';
  }
  env.configPath = findup(env.configNameRegex, {cwd: env.cwd, nocase: true});

  // finish populating environment if a config was found
  if(env.configPath) {
    env.configBase = path.dirname(env.configPath);
    // attempt to load local module and package
    try {
      env.modulePath = findLocal(this.moduleName, env.configBase);
      env.modulePackage = require(findup('package.json', {cwd: env.modulePath}));
    } catch (e) {
      try {
        env.modulePackage = require(findup('package.json', {cwd: env.configBase}));
        // check to see if we're developing against ourselves.  if we are, use
        // the 'main' property for our module path
        if(env.modulePackage.name === env.settings.moduleName) {
          env.modulePath = path.join(env.configBase, env.modulePackage.main||'index.js');
        } else {
          // null out modulePackage if we've grabbed values for some other project
          env.modulePackage = null;
        }
      } catch (e) {}
    }
  }

  // liftoff!
  fn.call(env, env);
};

module.exports = Liftoff;
