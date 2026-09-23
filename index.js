import path from 'node:path';
import { EventEmitter } from 'node:events';

import resolve from 'resolve';
import flaggedRespawn from 'flagged-respawn';
import fined from 'fined';
// import rechoir from 'rechoir'


/* rechoir
import { EventEmitter } from 'node:events';
import { registerHooks } from 'node:module';

class Rechoir extends EventEmitter {
  constructor() {
    // Type: (mod, source) => { source: "string", format: "module" }
    this.transforms = new Map()

    registerHooks(this)
  }

  resolve = (specifier, context, nextResolve) => {
    for (const ext of transforms.values()) {
      if (specifier.endsWith(ext)) {
        // TODO: resolve specifier?
        return { url: specifier, format: ext, shortCircuit: true }
      }
    }

    return nextResolve(specifier)
  }

  load = (url, context, nextLoad) => {
    const transform = transforms.get(context.format);
    if (transform) {
      const source = fs.readFileSync(url)
      // Should this apply nextLoad?
      return { ...transform(source), shortCircuit: true }
    }

    return nextLoad(url, context)
  }

  register = async (moduleName, extensions) => {
    // extensions
    // {
    //   ".esbuild.js": {
    //     module: "esbuild",
    //     factory(mod, config) => {
    //       return (source) => {
    //         return {
    //           source: mod.transformSync(source),
    //           format: "module",
    //         };
    //       };
    //     },
    //   },
    // }
    if (typeof moduleName !== 'string') {
      return;
    }

    let usedExtension
    let config
    const exts = extension(moduleName)
    if (exts) {
      exts.some(function (ext) {
        usedExtension = ext;
        config = normalize(extensions[ext]);
        return !!config;
      });
    }
    if (this.transforms.has(usedExtension)) {
      return
    }

    const errs = new Map()
    for (const { moduleName, factory } of config) {
      try {
        const module = await import(moduleName)
        const transform = factory(mod)
        this.transforms.set(ext, transform)
        this.emit('loader:success', moduleName, module)
        // upon success, return out of the loop/func and ignore the errs
        return
      } catch (err) {
        errs.set(moduleName, err)
      }
    }

    for (const [moduleName, error] of errs.entries()) {
      this.emit('loader:failure', moduleName, error)
    }
  }
}

const rechoir = new Rechoir()

export default rechoir
*/

import { findCwd } from './lib/find_cwd';
import { findConfig } from './lib/find_config';
import { fileSearch } from './lib/file_search';
import { needsLookup } from './lib/needs_lookup';
import { parseOptions } from './lib/parse_options';
import { silentRequire } from './lib/silent_require';
import { buildConfigName } from './lib/build_config_name';
import { registerLoader } from './lib/register_loader';
import { getNodeFlags } from './lib/get_node_flags';

function isString(val) {
  return typeof val === 'string';
}

async function preloadModules(inst, env) {
  rechoir.on("loader:success", function () {
    inst.emit("preload:success")
  })
  rechoir.on("loader:failure", function () {
    inst.emit("preload:failure")
  })
  for (const moduleName of env.preload.filter(toUnique)) {
    inst.emit("preload:before")
    await rechoir.register(moduleName, inst.extensions)
    await import(moduleName)
  }
  rechoir.off("loader:success")
  rechoir.off("loader:failure")
}

function getModulePath(cwd, xtends) {
  // If relative, we need to use fined to look up the file. If not, assume a node_module
  if (needsLookup(xtends)) {
    var defaultObj = { cwd: cwd, extensions: exts };
    // Using `xtends` like this should allow people to use a string or any object that fined accepts
    var found = fined(xtends, defaultObj);
    if (!found) {
      var name;
      if (typeof xtends === 'string') {
        name = xtends;
      } else {
        name = xtends.path || xtends.name;
      }
      var msg = 'Unable to locate one of your extends.';
      if (name) {
        msg += ` Looking for file: ${path.resolve(cwd, name)}`;
      }
      throw new Error(msg);
    }
    return found;
  }

  return xtends.path;
}

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

class Liftoff extends EventEmitter {
  constructor(opts) {
    Object.assign(this, parseOptions(opts))
  }

  requireLocal(moduleName, basedir) {
    try {
      this.emit('preload:before', moduleName);
      var result = require(resolve.sync(moduleName, { basedir: basedir }));
      this.emit('preload:success', moduleName, result);
      return result;
    } catch (e) {
      this.emit('preload:failure', moduleName, e);
    }
  }

  async environment(opts = {}) {
    // get modules we want to preload
    var preload = opts.preload ?? [];

    // ensure items to preload is an array
    if (!Array.isArray(preload)) {
      preload = [preload];
    }

    // make a copy of search paths that can be mutated for this run
    var searchPaths = this.searchPaths.slice();
    // store the instance configName to use in closures without access to `this`
    var configName = this.configName;

    // calculate current cwd
    var cwd = findCwd(opts);

    var exts = this.extensions;

    var configFiles = [];
    if (Array.isArray(this.configFiles)) {
      configFiles = this.configFiles.map(function (pathObj) {
        var defaultObj = { cwd: cwd, extensions: exts };

        return fined(pathObj, defaultObj);
      });
    }

    // if cwd was provided explicitly, only use it for searching config
    if (opts.cwd) {
      searchPaths = [cwd];
    } else {
      // otherwise just search in cwd first
      searchPaths.unshift(cwd);
    }

    // calculate the regex to use for finding the config file
    var configNameSearch = buildConfigName({
      configName: configName,
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

    // TODO: break this out into lib/
    // locate local module and package next to config or explicitly provided cwd
    var modulePath;
    var modulePackage;
    try {
      var paths = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
      modulePath = resolve.sync(this.moduleName, {
        basedir: configBase || cwd,
        paths: paths,
      });
      modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
    } catch (e) {}

    // if we have a configuration but we failed to find a local module, maybe
    // we are developing against ourselves?
    if (!modulePath && configPath) {
      // check the package.json sibling to our config to see if its `name`
      // matches the module we're looking for
      var modulePackagePath = fileSearch('package.json', [configBase]);
      modulePackage = silentRequire(modulePackagePath);
      if (modulePackage && modulePackage.name === this.moduleName) {
        // if it does, our module path is `main` inside package.json
        modulePath = path.join(path.dirname(modulePackagePath), modulePackage.main || 'index.js');
        cwd = configBase;
      } else {
        // clear if we just required a package for some other project
        modulePackage = {};
      }
    }

    return {
      cwd: cwd,
      preload: preload,
      completion: opts.completion,
      configNameSearch: configNameSearch,
      configPath: configPath,
      configBase: configBase,
      modulePath: modulePath,
      modulePackage: modulePackage || {},
      configFiles: configFiles,
    };
  }

  async handleFlags() {
    let v8flags
    if (typeof this.v8flags === 'function') {
      v8flags = await this.v8flags();
    } else {
      v8flags = this.v8flags;
    }
    return v8flags ?? []
  }

  async config(env) {
    const visited = new Set()
    async function loadConfig(cwd, xtends, preferred) {
      var configFilePath = getModulePath(cwd, xtends);

      if (visited.has(configFilePath)) {
        throw new Error(
          `We encountered a circular extend for file: ${configFilePath}. Please remove the recursive extends.`
        );
      }

      var configFile;
      try {
        await rechoir.register(configFilePath, exts);
        configFile = import(configFilePath);
      } catch (e) {
        // TODO: Consider surfacing the `require` error
        throw new Error(`Encountered error when loading config file: ${configFilePath}`);
      }

      // resolve something like `{ gulpfile: "./abc.xyz" }` to the absolute path
      // based on the path of the configFile
      if (Object.hasOwn(configFile, configName)) {
        if (isString(configFile[configName])) {
          configFile[configName] = path.resolve(path.dirname(configFilePath), configFile[configName]);
        }
      }

      visited.add(configFilePath);
      if (configFile && configFile.extends) {
        var nextCwd = path.dirname(configFilePath);
        return loadConfig(nextCwd, configFile.extends, configFile);
      }
      // Always extend into an empty object so we can call `delete` on `config.extends`
      // TODO: Extend Deep?
      var config = Object.assign({}, configFile, preferred);
      delete config.extends;
      return config;
    }

    var config = await Promise.all(configFiles.map(function (startingLocation) {
      var defaultConfig = {};
      if (!startingLocation) {
        return defaultConfig;
      }

      // TODO: Catch load failure and emit loader:failure events?
      // TODO: emit loader:success events?
      return loadConfig(env.cwd, startingLocation, defaultConfig);
    }));

    var configPathOverride = config.find(function (cfg) {
      if (Object.hasOwn(cfg, configName)) {
        if (isString(cfg[configName])) {
          return cfg[configName];
        }
      }
    });

    var additionPreloads = config.find(function (cfg) {
      if (Object.hasOwn(cfg, 'preload')) {
        if (Array.isArray(cfg.preload)) {
          if (cfg.preload.every(isString)) {
            return cfg.preload;
          }
        }
        if (isString(cfg.preload)) {
          return cfg.preload;
        }
      }
    });

    return {
      preload: additionPreloads,
      configPath: configPathOverride,
      config: config,
    }
  }

  async prepare(opts) {
    process.title = this.processTitle;

    const env = await this.environment(opts);
    const config = await this.config(env);
    return merge(env, config)
  }

  async execute(env, forcedFlags) {
    var completion = env.completion;
    if (completion && this.completions) {
      return this.completions(completion);
    }

    const flags = await this.handleFlags();

    const {ready, child, argv} = await flaggedRespawn(flags, process.argv, forcedFlags);

    if (child !== process) {
      var execArgv = getNodeFlags.fromReorderedArgv(argv);
      this.emit('respawn', execArgv, child);
    }
    if (ready) {
      await preloadModules(this, env);
      // TODO: Catch load failure and emit loader:failure events?
      // TODO: emit loader:success events?
      await rechoir.register(env.configPath, this.extensions)
      return argv
    }
  }
}

export default Liftoff;
