var expect = require('chai').expect;
var registerLoader = require('../../lib/register_loader');
var path = require('path');
var util = require('util');
var EE = require('events').EventEmitter;

var testDir = path.resolve(__dirname, '../fixtures/register_loader');

function App() {
  EE.call(this);
}
util.inherits(App, EE);

function handlerNotEmit(/* moduleName, moduleOrError */) {
  expect.fail(null, null, 'Should not pass this line.');
}

describe('registerLoader', function() {
  describe('register loader', function() {
    it('Should emit a "require" event when registering loader succeeds', function(done) {

      var loaderPath = path.join(testDir, 'require-cfg.js');
      var configPath = path.join(testDir, 'app.cfg');
      var extensions = { '.cfg': loaderPath };

      var app = new App();
      app.on('require', function(moduleName /* , module */) {
        expect(moduleName).to.be.equal(loaderPath);
        expect(require(configPath)).to.equal('Load app.cfg by require-cfg');
        done();
      });
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });

    it('Should emit only a "require" event when registering loader failed and succeeds', function(done) {

      var loaderPath = path.join(testDir, 'require-conf.js');
      var configPath = path.join(testDir, 'app.conf');
      var extensions = { '.conf': ['xxx', loaderPath] };

      var app = new App();
      app.on('require', function(moduleName /* , module */) {
        expect(moduleName).to.be.equal(loaderPath);
        expect(require(configPath)).to.equal('Load app.conf by require-conf');
        done();
      });
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });

    it('Should emit a "requireFail" event when loader is not found', function(done) {

      var loaderPath = path.join(testDir, 'require-tmp.js');
      var configPath = path.join(testDir, 'app.tmp');
      var extensions = { '.tmp': ['xxx', loaderPath] };

      var app = new App();
      var index = 0;
      app.on('requireFail', function(moduleName, error) {
        if (index === 0) {
          expect(moduleName).to.be.equal('xxx');
          expect(error).to.be.an('error');
          expect(error.message).to.contain('Cannot find module');
        } else if (index === 1) {
          expect(moduleName).to.be.equal(loaderPath);
          expect(error).to.be.an('error');
          expect(error.message).to.contain('Cannot find module');
          done();
        } else {
          done(new Error('Should not call more than two times'));
        }
        index++;
      });
      app.on('require', handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });

    it('Should emit a "requireFail" event when registering loader failed', function(done) {
      var loaderPath = path.join(testDir, 'require-fail.js');
      var configPath = path.join(testDir, 'app.tmp');
      var extensions = { '.tmp': loaderPath };

      var app = new App();
      app.on('requireFail', function(moduleName, error) {
        expect(moduleName).to.be.equal(loaderPath);
        expect(error).to.be.an('error');
        expect(error.message).to.contain('Fail to register!');
        done();
      });
      app.on('require', handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });
  });

  describe('cwd', function() {
    it('Should use "cwd" as a base directory of loaded file path if specified', function(done) {

      var loaderPath = path.join(testDir, 'require-rc.js');
      var configPath = 'app.rc';
      var extensions = { '.rc': loaderPath };

      var app = new App();
      app.on('require', function(moduleName /* , module */) {
        expect(moduleName).to.be.equal(loaderPath);
        var loadedFile = path.join(testDir, configPath);
        expect(require(loadedFile)).to.equal('Load app.rc by require-rc');
        done();
      });
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions, configPath, testDir);
    });
  });

  describe('extensions', function() {
    it('Should do nothing when extensions is null', function(done) {
      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app);

      registerLoader(app, null, 'aaa/bbb.cfg');
      registerLoader(app, null, 'aaa/bbb.cfg', '.');

      // .js is one of default extensions
      registerLoader(app, null, 'aaa/bbb.js');
      registerLoader(app, null, 'aaa/bbb.js', '.');
      done();
    });

    it('Should do nothing when extensions is illegal type', function(done) {
      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, 123, 'aaa/bbb.cfg');
      registerLoader(app, true, 'aaa/bbb.cfg');
      registerLoader(app, function() {}, 'aaa/bbb.cfg');
      registerLoader(app, ['.rc', '.cfg'], 'aaa/bbb.cfg');

      // .js is one of default extensions
      registerLoader(app, 123, 'aaa/bbb.js');
      registerLoader(app, true, 'aaa/bbb.js');
      registerLoader(app, function() {}, 'aaa/bbb.js');
      registerLoader(app, ['.js', '.json'], 'aaa/bbb.js');
      done();
    });

    it('Should do nothing when extensions is a string', function(done) {
      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, '.cfg', 'aaa/bbb.cfg');
      registerLoader(app, '.js', 'aaa/bbb.js');
      done();
    });
  });

  describe('configPath', function() {
    it('Should do nothing when configPath is null', function(done) {
      var extensions0 = ['.js', '.json', '.coffee', '.coffee.md'];
      var extensions1 = {
        '.js': null,
        '.json': null,
        '.coffee': 'coffee-script/register',
        '.coffee.md': 'coffee-script/register',
      };

      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions0);
      registerLoader(app, extensions1);
      registerLoader(app, extensions0, null, '.');
      registerLoader(app, extensions1, null, '.');
      done();
    });

    it('Should do nothing when configPath is illegal type', function(done) {
      var extensions0 = ['.js', '.json', '.coffee', '.coffee.md'];
      var extensions1 = {
        '.js': null,
        '.json': null,
        '.coffee': 'coffee-script/register',
        '.coffee.md': 'coffee-script/register',
      };

      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions0, 123);
      registerLoader(app, extensions0, ['aaa', 'bbb']);
      registerLoader(app, extensions1, {});
      registerLoader(app, extensions1, function() {});
      done();
    });

    it('Should do nothing when configPath does not end with one of extensions', function(done) {
      var loaderPath = path.join(testDir, 'require-rc.js');
      var configPath = path.join(testDir, 'app.xxx');
      var extensions = { '.cfg': loaderPath };

      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions, configPath);
      done();
    });

    it('Should do nothing when configPath ends with one of extensions of which the loader was already registered', function(done) {
      var loaderPath = path.join(testDir, 'require-cfg.js');
      var configPath = path.join(testDir, 'app.cfg');
      var extensions = { '.cfg': loaderPath };

      var app = new App();
      app.on('require', handlerNotEmit);
      app.on('requireFail', handlerNotEmit);

      registerLoader(app, extensions, configPath);
      done();
    });
  });

  describe('Multiple extensions', function() {
    it('should detect the shortest extension in extension candidates', function(done) {
      var loaderPath = path.join(testDir, 'require-file-b.js');
      var configPath = path.join(testDir, 'file.a.b');
      var extensions = { '.b': loaderPath };

      var app = new App();
      app.on('requireFail', handlerNotEmit);
      app.on('require', function(moduleName /* , module */) {
        expect(moduleName).to.be.equal(loaderPath);
        expect(require(configPath)).to.equal('Load file.a.b by require-file-b');
        done();
      });

      registerLoader(app, extensions, configPath);
    });

    it('should detect not shortest extension in extension candidates', function(done) {
      var loaderPath = path.join(testDir, 'require-file-bc.js');
      var configPath = path.join(testDir, 'file.a.b.c');
      var extensions = { '.b.c': loaderPath };

      var app = new App();
      app.on('requireFail', handlerNotEmit);
      app.on('require', function(moduleName /* , module */) {
        expect(moduleName).to.be.equal(loaderPath);
        expect(require(configPath)).to.equal('Load file.a.b.c by require-file-bc');
        done();
      });

      registerLoader(app, extensions, configPath);
    });

    it('Should update a loader of a longer extension but not update a loader of a shorter extension', function(done) {
      var loaderPathD = path.join(testDir, 'require-file-d.js');
      var loaderPathCD = path.join(testDir, 'require-file-cd.js');
      var loaderPathECD = path.join(testDir, 'require-file-ecd.js');
      var loaderPathFCD = path.join(testDir, 'require-file-fcd.js');

      var configPathD = path.join(testDir, 'file.a.b.d');
      var configPathCD = path.join(testDir, 'file.a.b.c.d');
      var configPathECD = path.join(testDir, 'file.a.e.c.d');
      var configPathFCD = path.join(testDir, 'file.a.f.c.d');

      var extensions = {
        '.d': loaderPathD,
        '.c.d': loaderPathCD,
        '.e.c.d': loaderPathECD,
        '.f.c.d': loaderPathFCD,
      };

      var count = 0;
      var app = new App();
      app.on('requireFail', handlerNotEmit);
      app.on('require', function(moduleName /* , module */) {
        switch (count) {
          case 0: {
            expect(moduleName).to.be.equal(loaderPathCD);
            expect(require(configPathCD)).to.equal('Load file.a.b.c.d by require-file-cd');
            break;
          }
          case 1: {
            expect(moduleName).to.be.equal(loaderPathECD);
            expect(require(configPathECD)).to.equal('Load file.a.e.c.d by require-file-ecd');
            break;
          }
          case 2: {
            expect(moduleName).to.be.equal(loaderPathFCD);
            expect(require(configPathFCD)).to.equal('Load file.a.f.c.d by require-file-fcd');
            done();
            break;
          }
        }
        count++;
      });

      registerLoader(app, extensions, configPathCD);
      registerLoader(app, extensions, configPathECD);
      registerLoader(app, extensions, configPathD); // Don't register loader.
      registerLoader(app, extensions, configPathFCD);
    });
  });

});

