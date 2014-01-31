#!/usr/bin/env node
'use strict';

var Liftoff = require('../');
//var liftoff = require('liftoff'); // you want this, not the above

var Hack = new Liftoff({
  moduleName: 'hack', // your npm module (installed locally to each project)
  configName: 'hackfile', // your module's configuration file name
  cwdOpt: 'cwd', // the cli option to change the cwd
  requireOpt: 'require' // the cli option for pre-requiring modules
}).on('require', function (name, module) {
  // called each time a module is pre-required
  if (name === 'coffee-script') {
    module.register();
  }
  console.log('required:', name);
}).on('requireFail', function (name, err) {
  // called each time a pre-required module can't be loaded
  console.log('failed to require:', name, err);
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
    process.chdir(this.configBase); // set the current working directory of
                                    // this process to the folder the config
                                    // is in.  now when you read or write
                                    // files, they'll be relative to it.
    require(this.configPath); // load your local config

  }
});

Hack.launch();
