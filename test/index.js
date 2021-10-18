var path = require('path');
var exec = require('child_process').exec;

var expect = require('expect');
var sinon = require('sinon');
var resolve = require('resolve');

var Liftoff = require('../');

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

describe('Liftoff', function () {
  this.timeout(5000);

  describe('buildEnvironment', function () {
    it('should locate local module using cwd if no config is found', function (done) {
      var test = new Liftoff({ name: 'chai' });
      var cwd = 'explicit/cwd';
      var spy = sinon.spy(resolve, 'sync');
      // NODE_PATH might be defined.
      delete process.env.NODE_PATH;
      test.buildEnvironment({ cwd: cwd });
      expect(
        spy.calledWith('chai', {
          basedir: path.join(process.cwd(), cwd),
          paths: [],
        })
      ).toBe(true);
      spy.restore();
      done();
    });

    it('should locate global module using NODE_PATH if defined', function (done) {
      var test = new Liftoff({ name: 'dummy' });
      var cwd = 'explicit/cwd';
      var spy = sinon.spy(resolve, 'sync');
      process.env.NODE_PATH = path.join(process.cwd(), cwd);
      test.buildEnvironment();
      expect(
        spy.calledWith('dummy', {
          basedir: process.cwd(),
          paths: [path.join(process.cwd(), cwd)],
        })
      ).toBe(true);
      spy.restore();
      done();
    });

    it("if cwd is explicitly provided, don't use search_paths", function (done) {
      expect(app.buildEnvironment({ cwd: './' }).configPath).toEqual(null);
      done();
    });

    it('should find case sensitive configPath', function (done) {
      var expected = path.resolve(
        __dirname,
        'fixtures',
        'case',
        process.platform === 'linux' ? 'Mochafile.js' : 'mochafile.js'
      );
      expect(
        app.buildEnvironment({ cwd: path.join(__dirname, 'fixtures', 'case') })
          .configPath
      ).toEqual(expected);
      done();
    });

    it('should find module in the directory next to config', function (done) {
      expect(app.buildEnvironment().modulePath).toEqual(
        path.resolve('node_modules/mocha/index.js')
      );
      done();
    });

    it('should require the package sibling to the module', function (done) {
      expect(app.buildEnvironment().modulePackage).toEqual(
        require('../node_modules/mocha/package.json')
      );
      done();
    });

    it("should set cwd to match the directory of the config file as long as cwd wasn't explicitly provided", function (done) {
      expect(app.buildEnvironment().cwd).toEqual(
        path.resolve('test/fixtures/search_path')
      );
      done();
    });

    describe('for developing against yourself', function () {
      it('should find and load package.json', function (done) {
        var fixturesDir = path.resolve(__dirname, 'fixtures');
        var cwd = path.resolve(fixturesDir, 'developing_yourself');

        exec('cd ' + cwd + ' && node main.js', cb);
        function cb(err, stdout, stderr) {
          expect(err).toEqual(null);
          expect(stderr).toEqual('');
          var fp = path.resolve(cwd, 'package.json');
          expect(stdout).toEqual(
            JSON.stringify(require(fp)) +
              '\n' +
              path.resolve(cwd, 'main.js') +
              '\n' +
              cwd +
              '\n'
          );
          done();
        }
      });

      it('should clear modulePackage if package.json is of different project', function (done) {
        var fixturesDir = path.resolve(__dirname, 'fixtures');
        var cwd = path.resolve(fixturesDir, 'developing_yourself/app1');

        exec('cd ' + cwd + ' && node index.js', cb);
        function cb(err, stdout, stderr) {
          expect(err).toEqual(null);
          expect(stderr).toEqual('');
          expect(stdout).toEqual('{}\n' + 'undefined\n' + cwd + '\n');
          done();
        }
      });

      it(
        'should use `index.js` if `main` property in package.json ' +
          'does not exist',
        function (done) {
          var fixturesDir = path.resolve(__dirname, 'fixtures');
          var cwd = path.resolve(fixturesDir, 'developing_yourself/app2');

          exec(
            'cd test/fixtures/developing_yourself/app2 && node index.js',
            cb
          );
          function cb(err, stdout, stderr) {
            expect(err).toEqual(null);
            expect(stderr).toEqual('');
            var fp = './fixtures/developing_yourself/app2/package.json';
            expect(stdout).toEqual(
              JSON.stringify(require(fp)) +
                '\n' +
                path.resolve(cwd, 'index.js') +
                '\n' +
                cwd +
                '\n'
            );
            done();
          }
        }
      );
    });
  });

  describe('prepare', function () {
    it('should set the process.title to the moduleName', function (done) {
      app.prepare({}, function () {
        expect(process.title).toEqual(app.moduleName);
        done();
      });
    });

    it('should call prepare with liftoff instance as context', function (done) {
      app.prepare({}, function () {
        expect(this).toEqual(app);
        done();
      });
    });

    it('should pass environment to first argument of prepare callback', function (done) {
      app.prepare({}, function (env) {
        expect(env).toEqual(app.buildEnvironment());
        done();
      });
    });

    it('should throw if 2nd arg is not a function', function (done) {
      expect(function () {
        app.prepare({});
      }).toThrow();
      done();
    });
  });

  describe('execute', function () {
    it('should pass environment to first argument of execute callback', function (done) {
      var testEnv = app.buildEnvironment();
      app.execute(testEnv, function (env) {
        expect(env).toEqual(testEnv);
        done();
      });
    });

    it('should throw if 2nd arg is not a function', function (done) {
      expect(function () {
        app.execute({});
      }).toThrow();
      done();
    });

    it('should return early if completions are available and requested', function (done) {
      var test = new Liftoff({
        name: 'whatever',
        completions: function () {
          done();
        },
      });
      test.prepare({ completion: true }, function (env) {
        test.execute(env);
      });
    });

    it('should skip respawning if process.argv has no values from v8flags in it', function (done) {
      exec(
        'node test/fixtures/prepare-execute/v8flags.js',
        function (err, stdout, stderr) {
          expect(stderr).toEqual('\n');
          exec(
            'node test/fixtures/prepare-execute/v8flags_function.js',
            function (err, stdout, stderr) {
              expect(stderr).toEqual('\n');
              done();
            }
          );
        }
      );
    });

    it('should respawn if process.argv has values from v8flags in it', function (done) {
      exec(
        'node test/fixtures/prepare-execute/v8flags.js --lazy',
        function (err, stdout, stderr) {
          expect(stderr).toEqual('--lazy\n');
          exec(
            'node test/fixtures/prepare-execute/v8flags_function.js --lazy',
            function (err, stdout, stderr) {
              expect(stderr).toEqual('--lazy\n');
              done();
            }
          );
        }
      );
    });

    it('should throw if v8flags is a function and it causes an error', function (done) {
      exec(
        'node test/fixtures/prepare-execute/v8flags_error.js --lazy',
        function (err, stdout, stderr) {
          expect(err).not.toEqual(null);
          expect(stdout).toEqual('');
          expect(stderr).toMatch('v8flags error!');
          done();
        }
      );
    });

    it('should respawn if v8flag is set by forcedFlags', function (done) {
      exec('node test/fixtures/prepare-execute/v8flags_config.js 123', cb);

      function cb(err, stdout, stderr) {
        expect(err).toEqual(null);
        expect(stderr).toEqual(
          [
            path.resolve('test/fixtures/prepare-execute/v8flags_config.js'),
            '123',
          ].join(' ') + '\n'
        );
        expect(stdout).toEqual("saw respawn [ '--lazy' ]\n");
        done();
      }
    });

    it('should respawn if v8flag is set by both cli flag and forcedFlags', function (done) {
      exec(
        'node test/fixtures/prepare-execute/v8flags_config.js 123 --harmony abc',
        cb
      );

      function cb(err, stdout, stderr) {
        expect(err).toEqual(null);
        expect(stderr).toEqual(
          [
            path.resolve('test/fixtures/prepare-execute/v8flags_config.js'),
            '123',
            'abc',
          ].join(' ') + '\n'
        );
        expect(stdout).toEqual("saw respawn [ '--lazy', '--harmony' ]\n");
        done();
      }
    });

    it('should emit a respawn event if a respawn is required', function (done) {
      exec(
        'node test/fixtures/prepare-execute/v8flags.js',
        function (err, stdout) {
          expect(stdout).toEqual('');
          exec(
            'node test/fixtures/prepare-execute/v8flags_function.js --lazy',
            function (err, stdout) {
              expect(stdout).toEqual('saw respawn\n');
              done();
            }
          );
        }
      );
    });

    it('should respawn if process.argv has v8flags with values in it', function (done) {
      exec(
        'node test/fixtures/prepare-execute/v8flags_value.js --stack_size=2048',
        function (err, stdout, stderr) {
          expect(stderr).toEqual('--stack_size=2048\n');
          done();
        }
      );
    });

    it('should respawn if v8flags is empty but forcedFlags are specified', function (done) {
      exec('node test/fixtures/prepare-execute/nodeflags_only.js 123', cb);

      function cb(err, stdout, stderr) {
        expect(err).toEqual(null);
        expect(stderr).toEqual(
          [
            path.resolve('test/fixtures/prepare-execute/nodeflags_only.js'),
            '123',
          ].join(' ') + '\n'
        );
        expect(stdout).toEqual("saw respawn [ '--lazy' ]\n");
        done();
      }
    });
  });

  describe('requireLocal', function () {
    it('should attempt pre-loading local modules if they are requested', function (done) {
      var app = new Liftoff({ name: 'test' });
      var logs = [];
      app.on('preload:success', function (moduleName, module) {
        expect(moduleName).toEqual('coffeescript/register');
        expect(module).toEqual(require('coffeescript/register'));
        logs.push('preload:success');
      });
      app.on('preload:failure', function (moduleName, err) {
        done(err);
      });
      app.prepare({ preload: ['coffeescript/register'] }, function (env) {
        app.execute(env, function (env) {
          expect(env.preload).toEqual(['coffeescript/register']);
          expect(logs).toEqual(['preload:success']);
          done();
        });
      });
    });

    it('should attempt pre-loading a local module if it is requested', function (done) {
      var app = new Liftoff({ name: 'test' });
      var logs = [];
      app.on('preload:success', function (moduleName, module) {
        expect(moduleName).toEqual('coffeescript/register');
        expect(module).toEqual(require('coffeescript/register'));
        logs.push('preload:success');
      });
      app.on('preload:failure', function (moduleName, err) {
        done(err);
      });
      app.prepare({ preload: 'coffeescript/register' }, function (env) {
        app.execute(env, function (env) {
          expect(env.preload).toEqual(['coffeescript/register']);
          expect(logs).toEqual(['preload:success']);
          done();
        });
      });
    });

    it('should attempt pre-loading local modules but fail', function (done) {
      var app = new Liftoff({ name: 'test' });
      var logs = [];
      app.on('preload:failure', function (moduleName, err) {
        expect(moduleName).toEqual('badmodule');
        expect(err).not.toEqual(null);
        logs.push('preload:failure');
      });
      app.prepare({ preload: 'badmodule' }, function (env) {
        app.execute(env, function (env) {
          expect(env.preload).toEqual(['badmodule']);
          expect(logs).toEqual(['preload:failure']);
          done();
        });
      });
    });

    it('should pre-load a local module only once even if be respawned', function (done) {
      var fixturesDir = path.resolve(__dirname, 'fixtures');

      exec('cd ' + fixturesDir + ' && node respawn_and_require.js', cb);
      function cb(err, stdout, stderr) {
        expect(err).toEqual(null);
        expect(stderr).toEqual('');
        expect(stdout).toEqual(
          "saw respawn [ '--lazy' ]\n" +
            'preload:success coffeescript/register\n' +
            'execute\n' +
            ''
        );
        done();
      }
    });

    it('should emit `preload:before` and `preload:success` with the name of the module and the required module', function (done) {
      var requireTest = new Liftoff({ name: 'require' });
      var isEmittedBeforeRequired = false;
      requireTest.on('preload:before', function (name) {
        expect(name).toEqual('mocha');
        isEmittedBeforeRequired = true;
      });
      requireTest.on('preload:success', function (name, module) {
        expect(name).toEqual('mocha');
        expect(module).toEqual(require('mocha'));
        expect(isEmittedBeforeRequired).toEqual(true);
        done();
      });
      requireTest.requireLocal('mocha', __dirname);
    });

    it("should emit `preload:before` and `preload:failure` with an error if a module can't be found.", function (done) {
      var requireFailTest = new Liftoff({ name: 'preload:failure' });
      var isEmittedBeforeRequired = false;
      requireFailTest.on('preload:before', function (name) {
        expect(name).toEqual('badmodule');
        isEmittedBeforeRequired = true;
      });
      requireFailTest.on('preload:failure', function (name) {
        expect(name).toEqual('badmodule');
        expect(isEmittedBeforeRequired).toEqual(true);
        done();
      });
      requireFailTest.requireLocal('badmodule', __dirname);
    });
  });

  describe('configFiles', function () {
    it('should be empty if not specified', function (done) {
      var app = new Liftoff({
        name: 'myapp',
      });
      app.prepare({}, function (env) {
        expect(env.configFiles).toEqual({});
        done();
      });
    });

    it('should find multiple files if specified', function (done) {
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
      app.prepare({}, function (env) {
        expect(env.configFiles).toEqual({
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

    it('should use default cwd if not specified', function (done) {
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
      app.prepare(
        {
          cwd: 'test/fixtures/configfiles',
        },
        function (env) {
          expect(env.configFiles).toEqual({
            index: {
              cwd: path.resolve('./test/fixtures/configfiles/index.json'),
            },
          });
          done();
        }
      );
    });

    it('should use default extensions if not specified', function (done) {
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
      app.prepare({}, function (env) {
        expect(env.configFiles).toEqual({
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

    it('should use specified loaders', function (done) {
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
              extensions: {
                // ignored
                '.js': './test/fixtures/configfiles/require-js',
                '.json': './test/fixtures/configfiles/require-json',
              },
            },
          },
        },
      });
      app.on('loader:failure', function (moduleName, error) {
        logFailure.push({ moduleName: moduleName, error: error });
      });
      app.on('loader:success', function (moduleName, module) {
        logRequire.push({ moduleName: moduleName, module: module });
      });
      app.prepare({}, function (env) {
        expect(env.configFiles).toEqual({
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

        expect(logRequire.length).toEqual(2);
        expect(logRequire[0].moduleName).toEqual(
          './test/fixtures/configfiles/require-txt'
        );
        expect(logRequire[1].moduleName).toEqual(
          './test/fixtures/configfiles/require-md'
        );

        expect(logFailure.length).toEqual(1);
        expect(logFailure[0].moduleName).toEqual(
          './test/fixtures/configfiles/require-non-exist'
        );

        expect(require(env.configFiles.README.markdown)).toEqual(
          'Load README.md by require-md'
        );
        expect(require(env.configFiles.README.text)).toEqual(
          'Load README.txt by require-txt'
        );
        expect(require(env.configFiles.index.test)).toEqual({ aaa: 'AAA' });
        done();
      });
    });
  });
});
