'use strict';
var util = require('util');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var zipObject = require('lodash.zipobject');
var findup = require('findup-sync');
var findCwd = require('./lib/find_cwd');
var findLocal = require('./lib/find_local');
var validExtensions = require('./lib/valid_extensions');

function Liftoff (opts) {
  this.localDeps = opts.localDeps||[];
  if(!Array.isArray(this.localDeps)) {
    this.localDeps = [this.localDeps];
  }
  this.processTitle = opts.processTitle;
  this.configName = opts.configName;
  this.cwdOpt = opts.cwdOpt||'cwd';
  this.requireOpt = opts.requireOpt||'require';
}
util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.requireLocal = function (dep, mute) {
  if(Array.isArray(dep)) {
    dep.forEach(this.requireLocal, this);
  } else {
    // try to find module from local cwd
    var modulePath = findLocal(dep, this.cwd);
    try {
      // if module path is an error, the requested module
      // could not be resolved.  throw the error so it gets
      // emitted
      if(modulePath instanceof Error) {
        throw modulePath;
      }
      var module = require(modulePath);
      if(!mute) {
        this.emit('require', dep, module);
      }
      return module;
    } catch (e) {
      if(!mute) {
        this.emit('requireFail', dep, e);
      }
    }
  }
};

Liftoff.prototype.launch = function (fn) {
  // set the process title
  process.title = this.processTitle;
  // parse cli
  this.args = require('optimist').argv;
  // get cwd
  this.cwd = findCwd(this.args[this.cwdOpt]);
  // load required modules
  this.localRequires = this.args[this.requireOpt];
  if(this.localRequires) {
    this.requireLocal(this.localRequires);
  }
  // set valid extensions
  this.validExtensions = validExtensions();
  // set the regex for finding a valid config file
  this.configNameRegex = this.configName+'{'+this.validExtensions+'}';
  // set config path based on what we can require
  this.configPath = findup(this.configNameRegex, {cwd: this.cwd, nocase: true});
  // if we found a config, load the requested module and matching package
  if(this.configPath) {
    // save base directory for config file
    this.configBase = path.dirname(this.configPath);
    // try to load local package.json (silently)
    try {
      this.localPackage = require(path.join(this.configBase,'package'));
    } catch (e) {}
    // map all dependencies to their local location
    this.depMap = zipObject(this.localDeps, this.localDeps.map(function (dep) {
      return findLocal(dep, this.configBase);
    }, this));
  }
  fn.apply(this);
};

module.exports = Liftoff;
