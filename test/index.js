const Liftoff = require('../');
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const sinon = require('sinon');
const resolve = require('resolve');
const exec = require('child_process').exec;

const NAME = 'mocha';
var app = new Liftoff({
  processTitle: NAME,
  configName: NAME+'file',
  moduleName: NAME,
  extensions: {
    '.js': null,
    '.json': null,
    '.coffee': 'coffee-script/register',
    '.coffee.md': 'coffee-script/register',
  },
  searchPaths: ['test/fixtures/search_path']
});

describe('Liftoff', function () {

  before(function () {
    if (!fs.existsSync('test/fixtures/symlink/mochafile.js')) {
      fs.symlinkSync(
        '../mochafile.js',
        'test/fixtures/symlink/mochafile.js'
      );
    }
  });

  describe('buildEnvironment', function () {

    it('should attempt pre-loading local modules if they are requested', function () {
      app.on('require', function (moduleName, module) {
        expect(moduleName).to.equal('coffee-script/register');
        expect(module).to.equal(require('coffee-script/register'));
      });
      var env = app.buildEnvironment({require:['coffee-script/register']});
      expect(env.require).to.deep.equal(['coffee-script/register']);
    });

    it('should attempt pre-loading local modules based on extension option', function () {
      app.on('require', function (moduleName, module) {
        expect(moduleName).to.equal('coffee-script/register');
        expect(module).to.equal(require('coffee-script/register'));
      });
      var env = app.buildEnvironment({
        configPath: 'test/fixtures/coffee/mochafile.coffee'
      });
      expect(env.require).to.deep.equal(['coffee-script/register']);
      // testing compound extension
      env = app.buildEnvironment({
        configPath: 'test/fixtures/coffee/mochafile.coffee.md'
      });
      expect(env.require).to.deep.equal(['coffee-script/register']);
    });

    it('should locate local module using cwd if no config is found', function () {
      var test = new Liftoff({name:'chai'});
      var cwd = 'explicit/cwd';
      var spy = sinon.spy(resolve, 'sync');
      test.buildEnvironment({cwd:cwd});
      expect(spy.calledWith('chai', {basedir:path.join(process.cwd(),cwd),paths:[]})).to.be.true;
      spy.restore();
    });

    it('should locate global module using NODE_PATH if defined', function () {
      var test = new Liftoff({name:'dummy'});
      var cwd = 'explicit/cwd';
      var spy = sinon.spy(resolve, 'sync');
      process.env.NODE_PATH = path.join(process.cwd(),cwd)
      test.buildEnvironment();
      expect(spy.calledWith('dummy', {basedir:process.cwd(),paths:[path.join(process.cwd(),cwd)]})).to.be.true;
      spy.restore();
    });

    it('if cwd is explicitly provided, don\'t use search_paths', function () {
      expect(app.buildEnvironment({cwd:'./'}).configPath).to.equal(null);
    });

    it('should find module in the directory next to config', function () {
      expect(app.buildEnvironment().modulePath).to.equal(path.resolve('node_modules/mocha/index.js'));
    });

    it('should require the package sibling to the module', function () {
      expect(app.buildEnvironment().modulePackage).to.equal(require('../node_modules/mocha/package.json'));
    });

    it('should set cwd to match the directory of the config file as long as cwd wasn\'t explicitly provided', function () {
      expect(app.buildEnvironment().cwd).to.equal(path.resolve('test/fixtures/search_path'));
    });

    it('should resolve symlinks if config is one', function () {
      var env = app.buildEnvironment({
        cwd: 'test/fixtures/symlink'
      });
      expect(env.configPath).to.equal(path.resolve('test/fixtures/mochafile.js'));
    });

    it('should set configBase to the folder of the symlink if configPath is a symlink', function () {
      var env = app.buildEnvironment({
        configPath: 'test/fixtures/symlink/mochafile.js'
      });
      expect(env.cwd).to.equal(path.resolve('test/fixtures/symlink'));
    })

  });

  describe('launch', function () {

    it('should set the process.title to the moduleName', function () {
      app.launch({}, function(){});
      expect(process.title).to.equal(app.moduleName);
    });

    it('should return early if completions are available and requested', function (done) {
      var test = new Liftoff({
        name: 'whatever',
        completions: function () {
          done();
        }
      });
      test.launch({completion:true}, function () {});
    });

    it('should call launch with liftoff instance as context', function (done) {
      app.launch({}, function () {
        expect(this).to.equal(app);
        done();
      });
    });

    it('should pass environment to first argument of launch callback', function (done) {
      app.launch({}, function (env) {
        expect(env).to.deep.equal(app.buildEnvironment());
        done();
      });
    });

    it('should skip respawning if process.argv has no values from v8flags in it', function (done) {
      exec('node test/fixtures/v8flags.js', function (err, stdout, stderr) {
        expect(stderr).to.equal('\n');
        exec('node test/fixtures/v8flags_function.js', function (err, stdout, stderr) {
          expect(stderr).to.equal('\n');
          done();
        });
      });

    });

    it('should respawn if process.argv has values from v8flags in it', function (done) {
      exec('node test/fixtures/v8flags.js --lazy', function (err, stdout, stderr) {
        expect(stderr).to.equal("--lazy\n");
        exec('node test/fixtures/v8flags_function.js --lazy', function (err, stdout, stderr) {
          expect(stderr).to.equal("--lazy\n");
          done();
        });
      });
    });

    it('should emit a respawn event if a respawn is required', function (done) {
      exec('node test/fixtures/v8flags.js', function (err, stdout) {
        expect(stdout).to.be.empty;
        exec('node test/fixtures/v8flags_function.js --lazy', function (err, stdout) {
          expect(stdout).to.equal('saw respawn\n');
          done();
        });
      });
    });

  });

  describe('requireLocal', function () {

    it('should emit `require` with the name of the module and the required module', function (done) {
      var requireTest = new Liftoff({name:'require'});
      requireTest.on('require', function (name, module) {
        expect(name).to.equal('mocha');
        expect(module).to.equal(require('mocha'));
        done();
      });
      requireTest.requireLocal('mocha', __dirname);
    });

    it('should emit `requireFail` with an error if a module can\'t be found.', function (done) {
      var requireFailTest = new Liftoff({name:'requireFail'});
      requireFailTest.on('requireFail', function (name) {
        expect(name).to.equal('badmodule');
        done();
      });
      requireFailTest.requireLocal('badmodule', __dirname);
    });

  });

});

require('./lib/build_config_name');
require('./lib/file_search');
require('./lib/find_config');
require('./lib/find_cwd');
require('./lib/parse_options');
require('./lib/silent_require');
