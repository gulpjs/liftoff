#!/usr/bin/env node
'use strict';

var Liftoff = require('../');
//var liftoff = require('liftoff'); // you want this, not the above

var hack = new Liftoff({
  moduleName: 'hack', // your npm module (installed locally to each project)
  configName: 'hackfile', // your module's configuration file name
  cwdOpt: 'cwd', // the cli option to change the cwd
  requireOpt: 'require' // the cli option for pre-requiring modules
}).on('require', function (name, module) {
  // console.log('required:', name, module);
}).on('requireFail', function (name, err) {
  // console.log('failed to require:', name, err);
}).on('run', function () {
  console.log('CLI OPTIONS:', this.args);
  console.log('CWD:', this.cwd);
  console.log('LOCAL MODULES REQUIRED:', this.localRequires);
  console.log('EXTENSIONS RECOGNIZED:', this.validExtensions);
  console.log('SEARCHING FOR:', this.configNameRegex);
  console.log('FOUND CONFIG AT:',  this.configPath);
  console.log('CONFIG BASE DIR:', this.configBase);
  console.log('YOUR LOCAL MODULE IS LOCATED AT:', this.modulePath);

  if(this.configPath) {
    require(this.configPath);
  }
});

hack.launch();
