'use strict';

var util = require('util');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

var findup = require('findup-sync');
var findCwd = require('./lib/find_cwd');
var findLocal = require('./lib/find_local');
var validExtensions = require('./lib/valid_extensions');

function Liftoff (opts) {
  this.moduleName = opts.moduleName;
  this.configName = opts.configName;
  this.cwdOpt = opts.cwdOpt||'cwd';
  this.requireOpt = opts.requireOpt||'require';
}
util.inherits(Liftoff, EventEmitter);

Liftoff.prototype.require = function (dep) {
  if(Array.isArray(dep)) {
    dep.forEach(this.require, this);
  } else {
    try {
      var module = require(findLocal(module, this.cwd));
      this.emit('require', dep, module);
      return module;
    } catch (e) {
      this.emit('requireFail', dep, e);
    }
  }
};

Liftoff.prototype.launch = function () {
  // parse cli
  this.args = require('optimist').argv;
  // get cwd
  this.cwd = findCwd(this.args[this.cwdOpt]);
  // load required modules
  this.localRequires = this.args[this.requireOpt]||null;
  if(this.localRequires) {
    this.require(this.localRequires);
  }
  // set valid extensions
  this.validExtensions = validExtensions();
  // set the regex for finding a valid config file
  this.configNameRegex = this.configName+'{'+this.validExtensions+'}';
  // set config path based on what we can require
  this.configPath = findup(this.configNameRegex, {cwd: this.cwd, nocase: true});
  // if we found a config, load the requested module and matching package
  if(this.configPath) {
    this.configBase = path.dirname(this.configPath);
    this.modulePath = findLocal(this.moduleName, this.configBase);
  }
  // kick it off!
  this.emit('run');
};

module.exports = Liftoff;
