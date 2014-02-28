const Liftoff = require('../');
const path = require('path');
const expect = require('chai').expect;

const NAME = 'mocha';

var appDefaults = new Liftoff({name: NAME})
var app = new Liftoff({
  processTitle: NAME,
  configName: NAME+'file',
  moduleName: NAME,
  cwdFlag: 'cwd',
  configPathFlag: NAME+'file',
  preloadFlag: 'require',
  completionFlag: 'completion',
  completion: function() {},
  addExtensions: [],
  searchPaths: ['test/fixtures/search_path']
});

describe('Liftoff', function () {

  describe('findCwd', function () {
    it('should return process.cwd if no special flags are passed', function () {
      expect(app.findCwd(({}))).to.equal(process.cwd());
    });
    it('should return path from cwdFlag if supplied', function () {
      expect(app.findCwd({cwd:'../'})).to.equal(path.resolve('../'));
    });
    it('should return directory of config if configPathFlag defined', function () {
      expect(app.findCwd({mochafile:'test/fixtures/mochafile.js'})).to.equal(path.resolve('test/fixtures'));
    });
    it('should return path from cwdFlag if both it and configPathFlag are defined', function () {
      expect(app.findCwd({cwd:'../',mochafile:'test/fixtures/mochafile.js'})).to.equal(path.resolve('../'));
    });
  });

  describe('buildEnvironment', function () {

    it('should attempt pre-loading local modules if they are requested', function () {
      var called = false;
      app.on('require', function () {
        called = true;
      });
      var env = app.buildEnvironment({require:['coffee-script']});
      expect(called).to.be.true;
      expect(env.preload).to.deep.equal(['coffee-script']);
    });

    it('should use configName directly if it is a regex', function () {
      var test = new Liftoff({
        processTitle: NAME,
        configName: /mocha/,
        moduleName: NAME
      });
      expect(test.buildEnvironment().configNameRegex.toString()).to.equal('/mocha/');
    });

    it('should use configName + addExtensions + extensions on require.extensions', function () {
      var test = new Liftoff({
        name: NAME,
        addExtensions: ['rc']
      });
      expect(test.buildEnvironment().configNameRegex.toString()).to.equal('mochafile{rc,.js,.json,.node}');
    });

    it('should locate config using cwd', function () {
      var cwdSaved = process.cwd();
      process.chdir('test/fixtures');
      expect(app.buildEnvironment({}).configPath).to.equal(path.resolve('mochafile.js'));
      process.chdir(cwdSaved);
    });

    it('should locate config using cwdFlag if supplied', function () {
      expect(app.buildEnvironment({cwd:'test/fixtures'}).configPath).to.equal(path.resolve('test/fixtures/mochafile.js'));
    });

    it('should return path of provided config, only if it exists', function () {
      var configPath = path.resolve('test/fixtures/mochafile.js');
      expect(app.buildEnvironment({mochafile:configPath}).configPath).to.equal(configPath);
      expect(app.buildEnvironment({mochafile:'path/to/nowhere'}).configPath).to.equal(null);
    });

    it('should return path of config if found in search paths', function () {
      expect(app.buildEnvironment().configPath).to.equal(path.resolve('test/fixtures/search_path/mochafile.js'));
    });

    it('should find module in the directory next to config', function () {
      expect(app.buildEnvironment().modulePath).to.equal(path.resolve('node_modules/mocha/index.js'));
    });

    it('should require the package sibling to the module', function () {
      expect(app.buildEnvironment().modulePackage).to.equal(require('../node_modules/mocha/package.json'));
    });

  });

  describe('launch', function () {

    it('should return early if completions are available and requested', function (done) {
      var called = false;
      var test = new Liftoff({
        name: 'whatever',
        completions: function () {
          done();
        }
      });
      test.launch(function(){},{completion:true});
    });

    it('should set the process.title to the moduleName', function () {
      app.launch(function(){});
      expect(process.title).to.equal(app.moduleName);
    });

    it('should call launch with liftoff instance as context', function (done) {
      app.launch(function () {
        expect(this).to.equal(app);
        done();
      });
    });

    it('should pass environment to first argument of launch callback', function (done) {
      process.argv = [];
      app.launch( function (env) {
        expect(env).to.deep.equal(app.buildEnvironment({"_":[]}));
        done();
      });
    });
  });

});

require('./file_search');
require('./parse_options');
require('./silent_require');
require('./valid_extensions');

