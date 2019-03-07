var Liftoff = require('../');
var path = require('path');
var expect = require('chai').expect;
var exec = require('child_process').exec;

var NAME = 'mocha';
var app = new Liftoff({
  processTitle: NAME,
  configName: NAME + 'file',
  moduleName: NAME,
  extensions: {
    '.js': null,
    '.json': null,
    '.coffee': 'coffee-script/register',
    '.coffee.md': 'coffee-script/register',
  },
  searchPaths: ['test/fixtures/search_path'],
});

describe('Liftoff (legacy)', function() {

  describe('launch', function() {
    // These are legacy tests to ensure launch does everything it used to
    // They have also been duplicated into the `prepare` and `execute` suites for future testing
    it('should set the process.title to the moduleName', function() {
      app.launch({}, function() {});
      expect(process.title).to.equal(app.moduleName);
    });

    it('should return early if completions are available and requested', function(done) {
      var test = new Liftoff({
        name: 'whatever',
        completions: function() {
          done();
        },
      });
      test.launch({ completion: true }, function() {});
    });

    it('should call launch with liftoff instance as context', function(done) {
      app.launch({}, function() {
        expect(this).to.equal(app);
        done();
      });
    });

    it('should pass environment to first argument of launch callback', function(done) {
      app.launch({}, function(env) {
        expect(env).to.deep.equal(app.buildEnvironment());
        done();
      });
    });

    it('should throw if 2nd arg is not a function', function() {
      expect(function() {
        app.launch({});
      }).to.throw();
    });

    it('should skip respawning if process.argv has no values from v8flags in it', function(done) {
      exec('node test/fixtures/v8flags.js', function(err, stdout, stderr) {
        expect(stderr).to.equal('\n');
        exec('node test/fixtures/v8flags_function.js', function(err, stdout, stderr) {
          expect(stderr).to.equal('\n');
          done();
        });
      });
    });

    it('should respawn if process.argv has values from v8flags in it', function(done) {
      exec('node test/fixtures/v8flags.js --lazy', function(err, stdout, stderr) {
        expect(stderr).to.equal('--lazy\n');
        exec('node test/fixtures/v8flags_function.js --lazy', function(err, stdout, stderr) {
          expect(stderr).to.equal('--lazy\n');
          done();
        });
      });
    });

    it('should throw if v8flags is a function and it causes an error', function(done) {
      exec('node test/fixtures/v8flags_error.js --lazy', function(err, stdout, stderr) {
        expect(err).not.to.equal(null);
        expect(stdout).to.equal('');
        expect(stderr).to.include('v8flags error!');
        done();
      });
    });

    it('should respawn if v8flag is set by opts.forcedFlags', function(done) {
      exec('node test/fixtures/v8flags_config.js 123', cb);

      function cb(err, stdout, stderr) {
        expect(err).to.equal(null);
        expect(stderr).to.equal([
          path.resolve('test/fixtures/v8flags_config.js'),
          '123',
        ].join(' ') + '\n');
        expect(stdout).to.equal('saw respawn [ \'--lazy\' ]\n');
        done();
      }
    });

    it('should respawn if v8flag is set by both cli flag and opts.forcedFlags', function(done) {
      exec('node test/fixtures/v8flags_config.js 123 --harmony abc', cb);

      function cb(err, stdout, stderr) {
        expect(err).to.equal(null);
        expect(stderr).to.equal([
          path.resolve('test/fixtures/v8flags_config.js'),
          '123',
          'abc',
        ].join(' ') + '\n');
        expect(stdout).to.equal('saw respawn [ \'--lazy\', \'--harmony\' ]\n');
        done();
      }
    });

    it('should emit a respawn event if a respawn is required', function(done) {
      exec('node test/fixtures/v8flags.js', function(err, stdout) {
        expect(stdout).to.be.empty;
        exec('node test/fixtures/v8flags_function.js --lazy', function(err, stdout) {
          expect(stdout).to.equal('saw respawn\n');
          done();
        });
      });
    });

    it('should respawn if process.argv has v8flags with values in it', function(done) {
      exec('node test/fixtures/v8flags_value.js --stack_size=2048', function(err, stdout, stderr) {
        expect(stderr).to.equal('--stack_size=2048\n');
        done();
      });
    });

    it('should respawn if v8flags is empty but forcedFlags are specified', function(done) {
      exec('node test/fixtures/nodeflags_only.js 123', cb);

      function cb(err, stdout, stderr) {
        expect(err).to.equal(null);
        expect(stderr).to.equal([
          path.resolve('test/fixtures/nodeflags_only.js'),
          '123',
        ].join(' ') + '\n');
        expect(stdout).to.equal('saw respawn [ \'--lazy\' ]\n');
        done();
      }
    });

  });

  describe('requireLocal', function() {

    it('should attempt pre-loading local modules if they are requested', function(done) {
      var app = new Liftoff({ name: 'test' });
      var logs = [];
      app.on('require', function(moduleName, module) {
        expect(moduleName).to.equal('coffeescript/register');
        expect(module).to.equal(require('coffeescript/register'));
        logs.push('require');
      });
      app.on('requireFail', function(moduleName, err) {
        done(err);
      });
      app.launch({ require: ['coffeescript/register'] }, function(env) {
        expect(env.require).to.deep.equal(['coffeescript/register']);
        expect(logs).to.deep.equal(['require']);
        done();
      });
    });

    it('should attempt pre-loading a local module if it is requested', function(done) {
      var app = new Liftoff({ name: 'test' });
      var logs = [];
      app.on('require', function(moduleName, module) {
        expect(moduleName).to.equal('coffeescript/register');
        expect(module).to.equal(require('coffeescript/register'));
        logs.push('require');
      });
      app.on('requireFail', function(moduleName, err) {
        done(err);
      });
      app.launch({ require: 'coffeescript/register' }, function(env) {
        expect(env.require).to.deep.equal(['coffeescript/register']);
        expect(logs).to.deep.equal(['require']);
        done();
      });
    });

    it('should attempt pre-loading local modules but fail', function(done) {
      var app = new Liftoff({ name: 'test' });
      var logs = [];
      app.on('require', function(/* moduleName, module */) {
        done();
      });
      app.on('requireFail', function(moduleName, err) {
        expect(moduleName).to.equal('badmodule');
        expect(err).to.not.equal(null);
        logs.push('requireFail');
      });
      app.launch({ require: 'badmodule' }, function(env) {
        expect(env.require).to.deep.equal(['badmodule']);
        expect(logs).to.deep.equal(['requireFail']);
        done();
      });
    });

    it('should pre-load a local module only once even if be respawned', function(done) {
      var fixturesDir = path.resolve(__dirname, 'fixtures');

      exec('cd ' + fixturesDir + ' && node respawn_and_require.js', cb);
      function cb(err, stdout, stderr) {
        expect(err).to.equal(null);
        expect(stderr).to.equal('');
        expect(stdout).to.equal(
          'saw respawn [ \'--lazy\' ]\n' +
          'require coffeescript/register\n' +
          'execute\n' +
        '');
        done();
      }
    });

    it('should emit `require` with the name of the module and the required module', function(done) {
      var requireTest = new Liftoff({ name: 'require' });
      requireTest.on('require', function(name, module) {
        expect(name).to.equal('mocha');
        expect(module).to.equal(require('mocha'));
        done();
      });
      requireTest.requireLocal('mocha', __dirname);
    });

    it('should emit `requireFail` with an error if a module can\'t be found.', function(done) {
      var requireFailTest = new Liftoff({ name: 'requireFail' });
      requireFailTest.on('requireFail', function(name) {
        expect(name).to.equal('badmodule');
        done();
      });
      requireFailTest.requireLocal('badmodule', __dirname);
    });

  });

  describe('configFiles', function() {
    it('should be empty if not specified', function(done) {
      var app = new Liftoff({
        name: 'myapp',
      });
      app.launch({}, function(env) {
        expect(env.configFiles).to.deep.equal({});
        done();
      });
    });

    it('should find multiple files if specified', function(done) {
      var app = new Liftoff({
        name: 'myapp',
        configFiles: {
          index: {
            currentdir: '.',
            test: {
              path: 'test/fixtures/configfiles',
            },
            findingup: {
              path: 'test',
              cwd: 'test/fixtures/configfiles',
              findUp: true,
            },
          },
          package: {
            currentdir: '.',
            test: {
              path: 'test/fixtures/configfiles',
            },
            findingup: {
              path: 'test',
              cwd: 'test/fixtures/configfiles',
              findUp: true,
            },
          },
        },
      });
      app.launch({}, function(env) {
        expect(env.configFiles).to.deep.equal({
          index: {
            currentdir: path.resolve('./index.js'),
            test: path.resolve('./test/fixtures/configfiles/index.json'),
            findingup: path.resolve('./test/index.js'),
          },
          package: {
            currentdir: path.resolve('./package.json'),
            test: null,
            findingup: null,
          },
        });
        done();
      });
    });

    it('should use default cwd if not specified', function(done) {
      var app = new Liftoff({
        name: 'myapp',
        configFiles: {
          index: {
            cwd: {
              path: '.',
              extensions: ['.js', '.json'],
            },
          },
        },
      });
      app.launch({
        cwd: 'test/fixtures/configfiles',
      }, function(env) {
        expect(env.configFiles).to.deep.equal({
          index: {
            cwd: path.resolve('./test/fixtures/configfiles/index.json'),
          },
        });
        done();
      });
    });

    it('should use default extensions if not specified', function(done) {
      var app = new Liftoff({
        extensions: { '.md': null, '.txt': null },
        name: 'myapp',
        configFiles: {
          README: {
            markdown: {
              path: '.',
            },
            text: {
              path: 'test/fixtures/configfiles',
            },
            markdown2: {
              path: '.',
              extensions: ['.json', '.js'],
            },
            text2: {
              path: 'test/fixtures/configfiles',
              extensions: ['.json', '.js'],
            },
          },
        },
      });
      app.launch({}, function(env) {
        expect(env.configFiles).to.deep.equal({
          README: {
            markdown: path.resolve('./README.md'),
            text: path.resolve('./test/fixtures/configfiles/README.txt'),
            markdown2: null,
            text2: null,
          },
        });
        done();
      });
    });

    it('should use specified loaders', function(done) {
      var logRequire = [];
      var logFailure = [];

      var app = new Liftoff({
        extensions: {
          '.md': './test/fixtures/configfiles/require-md',
        },
        name: 'myapp',
        configFiles: {
          README: {
            text_null: {
              path: 'test/fixtures/configfiles',
            },
            text_err: {
              path: 'test/fixtures/configfiles',
              extensions: {
                '.txt': './test/fixtures/configfiles/require-non-exist',
              },
            },
            text: {
              path: 'test/fixtures/configfiles',
              extensions: {
                '.txt': './test/fixtures/configfiles/require-txt',
              },
            },
            markdown: {
              path: '.',
            },
            markdown_badext: {
              path: '.',
              extensions: {
                '.txt': './test/fixtures/configfiles/require-txt',
              },
            },
            markdown_badext2: {
              path: '.',
              extensions: {
                '.txt': './test/fixtures/configfiles/require-non-exist',
              },
            },
          },
          // Intrinsic extension-loader mappings are prioritized.
          index: {
            test: {
              path: 'test/fixtures/configfiles',
              extensions: { // ignored
                '.js': './test/fixtures/configfiles/require-js',
                '.json': './test/fixtures/configfiles/require-json',
              },
            },
          },
        },
      });
      app.on('requireFail', function(moduleName, error) {
        logFailure.push({ moduleName: moduleName, error: error });
      });
      app.on('require', function(moduleName, module) {
        logRequire.push({ moduleName: moduleName, module: module });
      });
      app.launch({}, function(env) {
        expect(env.configFiles).to.deep.equal({
          README: {
            text: path.resolve('./test/fixtures/configfiles/README.txt'),
            text_null: null,
            text_err: path.resolve('./test/fixtures/configfiles/README.txt'),
            markdown: path.resolve('./README.md'),
            markdown_badext: null,
            markdown_badext2: null,
          },
          index: {
            test: path.resolve('./test/fixtures/configfiles/index.json'),
          },
        });

        expect(logRequire.length).to.equal(2);
        expect(logRequire[0].moduleName)
          .to.equal('./test/fixtures/configfiles/require-txt');
        expect(logRequire[1].moduleName)
          .to.equal('./test/fixtures/configfiles/require-md');

        expect(logFailure.length).to.equal(1);
        expect(logFailure[0].moduleName)
          .to.equal('./test/fixtures/configfiles/require-non-exist');

        expect(require(env.configFiles.README.markdown))
          .to.equal('Load README.md by require-md');
        expect(require(env.configFiles.README.text)).to
          .to.equal('Load README.txt by require-txt');
        expect(require(env.configFiles.index.test))
          .to.deep.equal({ aaa: 'AAA' });
        done();
      });
    });
  });

});
