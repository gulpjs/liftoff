var util = require('util');
var path = require('path');
var EE = require('events').EventEmitter;

var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');
var isPlainObject = require('is-plain-object');
var mapValues = require('object.map');
var fined = require('fined');

var findCwd = require('./lib/find_cwd');
var findConfig = require('./lib/find_config');
var parseOptions = require('./lib/parse_options');
var buildConfigName = require('./lib/build_config_name');
var registerLoader = require('./lib/register_loader');
var getNodeFlags = require('./lib/get_node_flags');
var findModule = require('./lib/find_module');

function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}
util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(module, basedir) {
  try {
    var result = require(resolve.sync(module, { basedir: basedir }));
    this.emit('require', module, result);
    return result;
  } catch (e) {
    this.emit('requireFail', module, e);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
  opts = opts || {};

  // get modules we want to preload
  var preload = opts.require || [];

  // ensure items to preload is an array
  if (!Array.isArray(preload)) {
    preload = [preload];
  }

  // make a copy of search paths that can be mutated for this run
  var searchPaths = this.searchPaths.slice();

  // calculate current cwd
  var cwd = findCwd(opts);

  // if cwd was provided explicitly, only use it for searching config
  if (opts.cwd) {
    searchPaths = [cwd];
  } else {
    // otherwise just search in cwd first
    searchPaths.unshift(cwd);
  }

  // calculate the regex to use for finding the config file
  var configNameSearch = buildConfigName({
    configName: this.configName,
    extensions: Object.keys(this.extensions),
  });

  // calculate configPath
  var configPath = findConfig({
    configNameSearch: configNameSearch,
    searchPaths: searchPaths,
    configPath: opts.configPath,
  });

  // if we have a config path, save the directory it resides in.
  var configBase;
  if (configPath) {
    configBase = path.dirname(configPath);
    // if cwd wasn't provided explicitly, it should match configBase
    if (!opts.cwd) {
      cwd = configBase;
    }
  }

  var mod = findModule(this.moduleName, configBase, cwd);

  var exts = this.extensions;
  var eventEmitter = this;

  var configFiles = {};
  if (isPlainObject(this.configFiles)) {
    var notfound = { path: null };
    configFiles = mapValues(this.configFiles, function(prop, name) {
      var defaultObj = { name: name, cwd: cwd, extensions: exts };
      return mapValues(prop, function(pathObj) {
        var found = fined(pathObj, defaultObj) || notfound;
        if (isPlainObject(found.extension)) {
          registerLoader(eventEmitter, found.extension, found.path, cwd);
        }
        return found.path;
      });
    });
  }

  return {
    cwd: cwd,
    require: preload,
    configNameSearch: configNameSearch,
    configPath: configPath,
    configBase: configBase,
    modulePath: mod.modulePath,
    modulePackage: mod.modulePackage,
    configFiles: configFiles,
  };
};

Liftoff.prototype.handleFlags = function(cb) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function(err, flags) {
      if (err) {
        cb(err);
      } else {
        cb(null, flags);
      }
    });
  } else {
    process.nextTick(function() {
      cb(null, this.v8flags);
    }.bind(this));
  }
};

Liftoff.prototype.prepare = function(opts, fn) {
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  process.title = this.processTitle;

  var completion = opts.completion;
  if (completion && this.completions) {
    return this.completions(completion);
  }

  var env = this.buildEnvironment(opts);

  fn.call(this, env);
};

Liftoff.prototype.execute = function(env, forcedFlags, fn) {
  if (typeof forcedFlags === 'function') {
    fn = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  this.handleFlags(function(err, flags) {
    if (err) {
      throw err;
    }
    flags = flags || [];

    flaggedRespawn(flags, process.argv, forcedFlags, execute.bind(this));

    function execute(ready, child, argv) {
      if (child !== process) {
        var execArgv = getNodeFlags.fromReorderedArgv(argv);
        this.emit('respawn', execArgv, child);
      }
      if (ready) {
        preloadModules(this, env);
        registerLoader(this, this.extensions, env.configPath, env.cwd);
        fn.call(this, env, argv);
      }
    }
  }.bind(this));
};

function preloadModules(inst, env) {
  var basedir = env.cwd;
  env.require.filter(toUnique).forEach(function(module) {
    inst.requireLocal(module, basedir);
  });
}

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

module.exports = Liftoff;
