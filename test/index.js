var path = require("node:path");
var Module = require("node:module");
var { stripVTControlCharacters } = require("node:util");
var exec = require("node:child_process").exec;
var assert = require("node:assert");
var { beforeEach, describe, it } = require("node:test");

var resolve = require("resolve");

var Liftoff = require("../");

var NAME = "mocha";
var app = new Liftoff({
  processTitle: NAME,
  configName: NAME + "file",
  moduleName: NAME,
  extensions: {
    ".js": null,
    ".json": null,
    ".coffee": "coffee-script/register",
    ".coffee.md": "coffee-script/register",
  },
  searchPaths: ["test/fixtures/search_path"],
});

// TODO: Consolidate between rechoir & liftoff
// save the original Module._extensions
var originalExtensions = Object.keys(Module._extensions);
var original = originalExtensions.reduce(function (result, key) {
  result[key] = require.extensions[key];
  return result;
}, {});
// save the original cache keys
var originalCacheKeys = Object.keys(require.cache);

function cleanupCache(key) {
  if (originalCacheKeys.indexOf(key) === -1) {
    delete require.cache[key];
  }
}

function cleanupExtensions(ext) {
  if (originalExtensions.indexOf(ext) === -1) {
    delete Module._extensions[ext];
  } else {
    Module._extensions[ext] = original[ext];
  }
}

function cleanup() {
  // restore the require.cache to startup state
  Object.keys(require.cache).forEach(cleanupCache);
  // restore the original Module._extensions
  Object.keys(Module._extensions).forEach(cleanupExtensions);
}

describe("Liftoff", { timeout: 5000 }, function () {
  beforeEach(cleanup);

  describe("buildEnvironment", function () {
    it("should locate local module using cwd if no config is found", function (t) {
      var test = new Liftoff({ name: "chai" });
      var cwd = "explicit/cwd";
      var spy = t.mock.method(resolve, "sync");
      // NODE_PATH might be defined.
      delete process.env.NODE_PATH;
      test.buildEnvironment({ cwd: cwd });
      assert.deepStrictEqual(
        [
          "chai",
          {
            basedir: path.join(process.cwd(), cwd),
            paths: [],
          },
        ],
        spy.mock.calls[0].arguments,
      );
    });

    it("should locate global module using NODE_PATH if defined", function (t) {
      var test = new Liftoff({ name: "dummy" });
      var cwd = "explicit/cwd";
      var spy = t.mock.method(resolve, "sync");
      process.env.NODE_PATH = path.join(process.cwd(), cwd);
      test.buildEnvironment();
      assert.deepStrictEqual(
        [
          "dummy",
          {
            basedir: process.cwd(),
            paths: [path.join(process.cwd(), cwd)],
          },
        ],
        spy.mock.calls[0].arguments,
      );
    });

    it("if cwd is explicitly provided, don't use search_paths", function () {
      assert.strictEqual(app.buildEnvironment({ cwd: "./" }).configPath, null);
    });

    it("should find case sensitive configPath", function () {
      var expected = path.resolve(
        __dirname,
        "fixtures",
        "case",
        process.platform === "linux" ? "Mochafile.js" : "mochafile.js",
      );
      assert.strictEqual(
        app.buildEnvironment({ cwd: path.join(__dirname, "fixtures", "case") })
          .configPath,
        expected,
      );
    });

    it("should find module in the directory next to config", function () {
      assert.strictEqual(
        app.buildEnvironment().modulePath,
        path.resolve("node_modules/mocha/index.js"),
      );
    });

    it("should require the package sibling to the module", function () {
      assert.strictEqual(
        app.buildEnvironment().modulePackage,
        require("../node_modules/mocha/package.json"),
      );
    });

    it("should set cwd to match the directory of the config file as long as cwd wasn't explicitly provided", function () {
      assert.strictEqual(
        app.buildEnvironment().cwd,
        path.resolve(__dirname, "./fixtures/search_path"),
      );
    });

    describe("for developing against yourself", function () {
      it("should find and load package.json", function () {
        var fixturesDir = path.resolve(__dirname, "fixtures");
        var cwd = path.resolve(fixturesDir, "developing_yourself");

        exec("cd " + cwd + " && node main.js", cb);
        function cb(err, stdout, stderr) {
          assert.strictEqual(err, null);
          assert.strictEqual(stderr, "");
          var fp = path.resolve(cwd, "package.json");
          assert.strictEqual(
            stdout,
            JSON.stringify(require(fp)) +
              "\n" +
              path.resolve(cwd, "main.js") +
              "\n" +
              cwd +
              "\n",
          );
        }
      });

      it("should clear modulePackage if package.json is of different project", function (t, done) {
        var fixturesDir = path.resolve(__dirname, "fixtures");
        var cwd = path.resolve(fixturesDir, "developing_yourself/app1");

        exec("cd " + cwd + " && node index.js", cb);
        function cb(err, stdout, stderr) {
          assert.strictEqual(err, null);
          assert.strictEqual(stderr, "");
          assert.strictEqual(
            stripVTControlCharacters(stdout),
            "{}\n" + "undefined\n" + cwd + "\n",
          );
          done();
        }
      });

      it(
        "should use `index.js` if `main` property in package.json " +
          "does not exist",
        function () {
          var fixturesDir = path.resolve(__dirname, "fixtures");
          var cwd = path.resolve(fixturesDir, "developing_yourself/app2");

          exec(
            "cd test/fixtures/developing_yourself/app2 && node index.js",
            cb,
          );
          function cb(err, stdout, stderr) {
            assert.strictEqual(err, null);
            assert.strictEqual(stderr, "");
            var fp = "./fixtures/developing_yourself/app2/package.json";
            assert.strictEqual(
              stdout,
              JSON.stringify(require(fp)) +
                "\n" +
                path.resolve(cwd, "index.js") +
                "\n" +
                cwd +
                "\n",
            );
          }
        },
      );
    });
  });

  describe("prepare", function () {
    it("should set the process.title to the moduleName", function () {
      app.prepare({}, function () {
        assert.strictEqual(process.title, app.moduleName);
      });
    });

    it("should call prepare with liftoff instance as context", function () {
      app.prepare({}, function () {
        assert.strictEqual(this, app);
      });
    });

    it("should pass environment to first argument of prepare callback", function (t, done) {
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env, app.buildEnvironment());
        done();
      });
    });

    it("should throw if 2nd arg is not a function", function () {
      assert.throws(function () {
        app.prepare({});
      });
    });
  });

  describe("execute", function () {
    it("should pass environment to first argument of execute callback", function (t, done) {
      var testEnv = app.buildEnvironment();
      app.execute(testEnv, function (env) {
        assert.strictEqual(env, testEnv);
        done();
      });
    });

    it("should throw if 2nd arg is not a function", function () {
      assert.throws(function () {
        app.execute({});
      });
    });

    it("should return early if completions are available and requested", function (t, done) {
      var test = new Liftoff({
        name: "whatever",
        completions: function () {
          done();
        },
      });
      test.prepare({ completion: true }, function (env) {
        test.execute(env);
      });
    });

    it("should skip respawning if process.argv has no values from v8flags in it", function (t, done) {
      exec(
        "node test/fixtures/prepare-execute/v8flags.js",
        function (err, stdout, stderr) {
          assert.strictEqual(stderr, "\n");
          exec(
            "node test/fixtures/prepare-execute/v8flags_function.js",
            function (err, stdout, stderr) {
              assert.strictEqual(stderr, "\n");
              done();
            },
          );
        },
      );
    });

    it("should respawn if process.argv has values from v8flags in it", function (t, done) {
      exec(
        "node test/fixtures/prepare-execute/v8flags.js --lazy",
        function (err, stdout, stderr) {
          assert.strictEqual(stderr, "--lazy\n");
          exec(
            "node test/fixtures/prepare-execute/v8flags_function.js --lazy",
            function (err, stdout, stderr) {
              assert.strictEqual(stderr, "--lazy\n");
              done();
            },
          );
        },
      );
    });

    it("should throw if v8flags is a function and it causes an error", function (t, done) {
      exec(
        "node test/fixtures/prepare-execute/v8flags_error.js --lazy",
        function (err, stdout, stderr) {
          assert.strictEqual(err instanceof Error, true);
          assert.strictEqual(stdout, "");
          assert.match(stderr, /v8flags error!/);
          done();
        },
      );
    });

    it("should respawn if v8flag is set by forcedFlags", function (t, done) {
      exec("node test/fixtures/prepare-execute/v8flags_config.js 123", cb);

      function cb(err, stdout, stderr) {
        assert.strictEqual(err, null);
        assert.strictEqual(
          stderr,
          [
            path.resolve(
              __dirname,
              "./fixtures/prepare-execute/v8flags_config.js",
            ),
            "123",
          ].join(" ") + "\n",
        );
        assert.deepStrictEqual(
          stripVTControlCharacters(stdout),
          "saw respawn [ '--lazy' ]\n",
        );
        done();
      }
    });

    it("should respawn if v8flag is set by both cli flag and forcedFlags", function (t, done) {
      exec(
        "node test/fixtures/prepare-execute/v8flags_config.js 123 --harmony abc",
        cb,
      );

      function cb(err, stdout, stderr) {
        assert.strictEqual(err, null);
        assert.strictEqual(
          stderr,
          [
            path.resolve(
              __dirname,
              "./fixtures/prepare-execute/v8flags_config.js",
            ),
            "123",
            "abc",
          ].join(" ") + "\n",
        );
        assert.strictEqual(
          stripVTControlCharacters(stdout),
          "saw respawn [ '--lazy', '--harmony' ]\n",
        );
        done();
      }
    });

    it("should emit a respawn event if a respawn is required", function (t, done) {
      exec(
        "node test/fixtures/prepare-execute/v8flags.js",
        function (err, stdout) {
          assert.strictEqual(stdout, "");
          exec(
            "node test/fixtures/prepare-execute/v8flags_function.js --lazy",
            function (err, stdout) {
              assert.strictEqual(stdout, "saw respawn\n");
              done();
            },
          );
        },
      );
    });

    it("should respawn if process.argv has v8flags with values in it", function (t, done) {
      exec(
        "node test/fixtures/prepare-execute/v8flags_value.js --stack_size=2048",
        function (err, stdout, stderr) {
          assert.strictEqual(stderr, "--stack_size=2048\n");
          done();
        },
      );
    });

    it("should respawn if v8flags is empty but forcedFlags are specified", function (t, done) {
      exec("node test/fixtures/prepare-execute/nodeflags_only.js 123", cb);

      function cb(err, stdout, stderr) {
        assert.strictEqual(err, null);
        assert.strictEqual(
          stderr,
          [
            path.resolve(
              __dirname,
              "./fixtures/prepare-execute/nodeflags_only.js",
            ),
            "123",
          ].join(" ") + "\n",
        );
        assert.strictEqual(
          stripVTControlCharacters(stdout),
          "saw respawn [ '--lazy' ]\n",
        );
        done();
      }
    });
  });

  describe("requireLocal", function () {
    it("should attempt pre-loading local modules if they are requested", function (t, done) {
      var app = new Liftoff({ name: "test" });
      var logs = [];
      app.on("preload:success", function (moduleName, module) {
        assert.strictEqual(moduleName, "coffeescript/register");
        assert.strictEqual(module, require("coffeescript/register"));
        logs.push("preload:success");
      });
      app.on("preload:failure", function (moduleName, err) {
        done(err);
      });
      app.prepare({ preload: ["coffeescript/register"] }, function (env) {
        app.execute(env, function (env) {
          assert.deepStrictEqual(env.preload, ["coffeescript/register"]);
          assert.deepStrictEqual(logs, ["preload:success"]);
          done();
        });
      });
    });

    it("should attempt pre-loading a local module if it is requested", function (t, done) {
      var app = new Liftoff({ name: "test" });
      var logs = [];
      app.on("preload:success", function (moduleName, module) {
        assert.strictEqual(moduleName, "coffeescript/register");
        assert.strictEqual(module, require("coffeescript/register"));
        logs.push("preload:success");
      });
      app.on("preload:failure", function (moduleName, err) {
        done(err);
      });
      app.prepare({ preload: "coffeescript/register" }, function (env) {
        app.execute(env, function (env) {
          assert.deepStrictEqual(env.preload, ["coffeescript/register"]);
          assert.deepStrictEqual(logs, ["preload:success"]);
          done();
        });
      });
    });

    it("should attempt pre-loading local modules but fail", function (t, done) {
      var app = new Liftoff({ name: "test" });
      var logs = [];
      app.on("preload:failure", function (moduleName, err) {
        assert.strictEqual(moduleName, "badmodule");
        assert.notStrictEqual(err, null);
        logs.push("preload:failure");
      });
      app.prepare({ preload: "badmodule" }, function (env) {
        app.execute(env, function (env) {
          assert.deepStrictEqual(env.preload, ["badmodule"]);
          assert.deepStrictEqual(logs, ["preload:failure"]);
          done();
        });
      });
    });

    it("should pre-load a local module only once even if be respawned", function (t, done) {
      var fixturesDir = path.resolve(__dirname, "fixtures");

      exec("cd " + fixturesDir + " && node respawn_and_require.js", cb);
      function cb(err, stdout, stderr) {
        assert.strictEqual(err, null);
        assert.strictEqual(stderr, "");
        assert.strictEqual(
          stripVTControlCharacters(stdout),
          "saw respawn [ '--lazy' ]\n" +
            "preload:success coffeescript/register\n" +
            "execute\n" +
            "",
        );
        done();
      }
    });

    it("should emit `preload:before` and `preload:success` with the name of the module and the required module", function (t, done) {
      var requireTest = new Liftoff({ name: "require" });
      var isEmittedBeforeRequired = false;
      requireTest.on("preload:before", function (name) {
        assert.strictEqual(name, "mocha");
        isEmittedBeforeRequired = true;
      });
      requireTest.on("preload:success", function (name, module) {
        assert.strictEqual(name, "mocha");
        assert.strictEqual(module, require("mocha"));
        assert.strictEqual(isEmittedBeforeRequired, true);
        done();
      });
      requireTest.requireLocal("mocha", __dirname);
    });

    it("should emit `preload:before` and `preload:failure` with an error if a module can't be found.", function (t, done) {
      var requireFailTest = new Liftoff({ name: "preload:failure" });
      var isEmittedBeforeRequired = false;
      requireFailTest.on("preload:before", function (name) {
        assert.strictEqual(name, "badmodule");
        isEmittedBeforeRequired = true;
      });
      requireFailTest.on("preload:failure", function (name) {
        assert.strictEqual(name, "badmodule");
        assert.strictEqual(isEmittedBeforeRequired, true);
        done();
      });
      requireFailTest.requireLocal("badmodule", __dirname);
    });
  });

  describe("configFiles", function () {
    it("should be empty if not specified", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, []);
        done();
      });
    });

    it("excludes files if value is not an array", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: {
          name: "foobar",
        },
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, []);
        done();
      });
    });

    it("should find multiple files if specified", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "testconfig", path: "." },
          { name: "testconfig", path: "test/fixtures/configfiles" },
          {
            name: "testconfig",
            path: "test",
            cwd: "text/fixtures/configfiles",
            findUp: true,
          },
          { name: "package", path: "." },
          { name: "package", path: "test/fixtures/configfiles" },
          {
            name: "package",
            path: "test",
            cwd: "text/fixtures/configfiles",
            findUp: true,
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          null,
          path.resolve(__dirname, "./fixtures/configfiles/testconfig.json"),
          null,
          path.resolve(__dirname, "../package.json"),
          null,
          null,
        ]);
        done();
      });
    });

    it("should use prepare cwd if specified", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "testconfig", path: ".", extensions: [".js", ".json"] },
        ],
      });
      app.prepare(
        {
          cwd: "test/fixtures/configfiles",
        },
        function (env) {
          assert.deepStrictEqual(env.configFiles, [
            path.resolve(__dirname, "./fixtures/configfiles/testconfig.json"),
          ]);
          done();
        },
      );
    });

    it("overrides the configPath if the configName key exists in the config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "override-config-path-absolute",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.match(env.configPath, /override-the-config-path\.js$/);
        done();
      });
    });

    it("resolves relative configPath if the configName key exists in the config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "override-config-path-relative",
            path: "test/fixtures/configfiles",
            extensions: [".json"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.match(env.configPath, /override-the-config-path\.js$/);
        done();
      });
    });

    it("ignores non-string configPath if the configName key exists in the config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "override-config-path-non-string",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.strictEqual(env.configPath, null);
        done();
      });
    });

    it("adds array of preloads specified in config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "preload-array",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.preload, ["abc", "xyz"]);
        done();
      });
    });

    it("combines array of preloads specified in config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "preload-array",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare(
        {
          preload: ["123"],
        },
        function (env) {
          assert.deepStrictEqual(env.preload, ["123", "abc", "xyz"]);
          done();
        },
      );
    });

    it("adds string preload specified in config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "preload-string",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.preload, ["abc"]);
        done();
      });
    });

    it("combines string preload specified in config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "preload-string",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare(
        {
          preload: ["xyz"],
        },
        function (env) {
          assert.deepStrictEqual(env.preload, ["xyz", "abc"]);
          done();
        },
      );
    });

    it("ignores non-string/non-array preload specified in config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "preload-invalid",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.preload, []);
        done();
      });
    });

    it("ignores array with any non-strings preload specified in config", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "preload-invalid-array",
            path: "test/fixtures/configfiles",
            extensions: [".js"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.preload, []);
        done();
      });
    });

    it("should use dirname of configPath if no cwd is specified", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "testconfig", path: ".", extensions: [".js", ".json"] },
        ],
      });
      app.prepare(
        {
          configPath: "test/fixtures/configfiles/myapp.js",
        },
        function (env) {
          assert.deepStrictEqual(env.configFiles, [
            path.resolve(__dirname, "./fixtures/configfiles/testconfig.json"),
          ]);
          done();
        },
      );
    });

    it("uses default extensions if not specified (.md)", function (t, done) {
      var app = new Liftoff({
        extensions: {
          ".md": "./test/fixtures/configfiles/require-md",
        },
        name: "myapp",
        configFiles: [{ name: "README", path: "." }],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          path.resolve(__dirname, "../README.md"),
        ]);
        done();
      });
    });

    it("use default extensions if not specified (.txt)", function (t, done) {
      var app = new Liftoff({
        extensions: {
          ".txt": "./test/fixtures/configfiles/require-txt",
        },
        name: "myapp",
        configFiles: [{ name: "README", path: "test/fixtures/configfiles" }],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          path.resolve(__dirname, "./fixtures/configfiles/README.txt"),
        ]);
        done();
      });
    });

    it("does not use default extensions if specified (.js)", function (t, done) {
      var app = new Liftoff({
        extensions: { ".md": null, ".txt": null },
        name: "myapp",
        configFiles: [{ name: "README", path: ".", extensions: [".js"] }],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [null]);
        done();
      });
    });

    it("does not use default extensions if specified (.json)", function (t, done) {
      var app = new Liftoff({
        extensions: { ".md": null, ".txt": null },
        name: "myapp",
        configFiles: [
          {
            name: "README",
            path: "test/fixtures/configfiles",
            extensions: [".json"],
          },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [null]);
        done();
      });
    });

    it("should use specified loaders (.md)", function (t, done) {
      var logRequire = [];

      var app = new Liftoff({
        extensions: {
          ".md": "./test/fixtures/configfiles/require-md",
        },
        name: "myapp",
        configFiles: [{ name: "README", path: "." }],
      });
      app.on("loader:success", function (moduleName, module) {
        logRequire.push({ moduleName: moduleName, module: module });
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          path.resolve(__dirname, "../README.md"),
        ]);

        assert.strictEqual(logRequire.length, 1);
        assert.strictEqual(
          logRequire[0].moduleName,
          "./test/fixtures/configfiles/require-md",
        );

        assert.strictEqual(
          require(env.configFiles[0]),
          "Load README.md by require-md",
        );
        done();
      });
    });

    it("should use specified loaders (.txt)", function (t, done) {
      var logRequire = [];

      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "README",
            path: "test/fixtures/configfiles",
            extensions: { ".txt": "./test/fixtures/configfiles/require-txt" },
          },
        ],
      });
      app.on("loader:success", function (moduleName, module) {
        logRequire.push({ moduleName: moduleName, module: module });
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          path.resolve(__dirname, "./fixtures/configfiles/README.txt"),
        ]);

        assert.strictEqual(logRequire.length, 1);
        assert.strictEqual(
          logRequire[0].moduleName,
          "./test/fixtures/configfiles/require-txt",
        );

        assert.strictEqual(
          require(env.configFiles[0]),
          "Load README.txt by require-txt",
        );
        done();
      });
    });

    it("emits `loader:failure` but still resolves with invalid loaders", function (t, done) {
      var logFailure = [];

      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "README",
            path: "test/fixtures/configfiles",
            extensions: {
              ".txt": "./test/fixtures/configfiles/require-non-exist",
            },
          },
        ],
      });
      app.on("loader:failure", function (moduleName, error) {
        logFailure.push({ moduleName: moduleName, error: error });
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          path.resolve(__dirname, "./fixtures/configfiles/README.txt"),
        ]);

        assert.strictEqual(logFailure.length, 1);
        assert.strictEqual(
          logFailure[0].moduleName,
          "./test/fixtures/configfiles/require-non-exist",
        );

        done();
      });
    });

    it("prioritizes intrinsic extension-loader mappings", function (t, done) {
      var logRequire = [];
      var logFailure = [];

      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "testconfig",
            path: "test/fixtures/configfiles",
            extensions: {
              // ignored
              ".js": "./test/fixtures/configfiles/require-js",
              ".json": "./test/fixtures/configfiles/require-json",
            },
          },
        ],
      });
      app.on("loader:failure", function (moduleName, error) {
        logFailure.push({ moduleName: moduleName, error: error });
      });
      app.on("loader:success", function (moduleName, module) {
        logRequire.push({ moduleName: moduleName, module: module });
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.configFiles, [
          path.resolve(__dirname, "./fixtures/configfiles/testconfig.json"),
        ]);

        assert.strictEqual(logRequire.length, 0);
        assert.strictEqual(logFailure.length, 0);

        assert.deepStrictEqual(require(env.configFiles[0]), { aaa: "AAA" });
        done();
      });
    });
  });

  describe("config", function () {
    it("is empty if `configFiles` is not specified", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.config, []);
        done();
      });
    });

    it("loads all config for every found configFile", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "testconfig", path: "test/fixtures/configfiles" },
          { name: "testconfig", path: "test/fixtures/configfiles-extends" },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.config, [
          {
            aaa: "AAA",
          },
          {
            aaa: "AAA", // Comes from the base, which overrode `aaa: 'CCC'` in the `extends`
            bbb: "BBB", // Comes from the `extends`
          },
        ]);
        done();
      });
    });

    it("loads config if a `configFiles` is found and makes it available with the same key on `config`", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "testconfig", path: "test/fixtures/configfiles" },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.config, [
          {
            aaa: "AAA",
          },
        ]);
        done();
      });
    });

    it("loads and merges a config file specified if loaded file provides `extends` property", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "testconfig", path: "test/fixtures/configfiles-extends" },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.config, [
          {
            aaa: "AAA", // Comes from the base, which overrode `aaa: 'CCC'` in the `extends`
            bbb: "BBB", // Comes from the `extends`
          },
        ]);
        done();
      });
    });

    it("throws error on circular extends", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "circular1", path: "test/fixtures/configfiles-extends" },
        ],
      });
      var circPath = path.resolve(
        __dirname,
        "./fixtures/configfiles-extends/circular1.json",
      );
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(circPath),
      ); // Ensure that the error includes the circular path
    });

    it("gracefully handles a null-ish extends", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "null", path: "test/fixtures/configfiles-extends" },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.config, [{}]);
        done();
      });
    });

    it("stops processing extends on an empty (or null-ish) extends", function (t, done) {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "load-empty", path: "test/fixtures/configfiles-extends" },
        ],
      });
      app.prepare({}, function (env) {
        assert.deepStrictEqual(env.config, [
          {
            aaa: "bbb",
            ccc: "ddd",
          },
        ]);
        done();
      });
    });

    it("throws upon extends of missing local file", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "local-missing", path: "test/fixtures/configfiles-extends" },
        ],
      });
      var missingPath = path.resolve(
        __dirname,
        "./fixtures/configfiles-extends/not-exists",
      );
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(missingPath),
      );
    });

    it("throws (with correct path) upon extends of missing deep in tree", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "extend-missing", path: "test/fixtures/configfiles-extends" },
        ],
      });
      var missingPath = path.resolve(
        __dirname,
        "./fixtures/configfiles-extends/not-exists",
      );
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(missingPath),
      );
    });

    it("throws (with correct path) upon extends using `fined` object with `path`", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "missing-path-obj",
            path: "test/fixtures/configfiles-extends",
          },
        ],
      });
      var missingPath = path.resolve(
        __dirname,
        "./fixtures/configfiles-extends/not-exists",
      );
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(missingPath),
      );
    });

    it("throws (with correct path) upon extends using `fined` object with `name`", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "missing-name-obj",
            path: "test/fixtures/configfiles-extends",
          },
        ],
      });
      var missingPath = path.resolve(
        __dirname,
        "./fixtures/configfiles-extends/not-exists",
      );
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(missingPath),
      );
    });

    it("throws (without path) upon extends using invalid `fined` object", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          {
            name: "missing-invalid-obj",
            path: "test/fixtures/configfiles-extends",
          },
        ],
      });
      assert.throws(
        function () {
          app.prepare({}, function () {});
        },
        { message: /^Unable to locate one of your extends\.$/ },
      );
    });

    it("throws upon extends of missing npm module", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "npm-missing", path: "test/fixtures/configfiles-extends" },
        ],
      });
      var missingModule = "not-installed";
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(missingModule),
      );
    });

    it("throws upon extends if loading file errors", function () {
      var app = new Liftoff({
        name: "myapp",
        configFiles: [
          { name: "throws", path: "test/fixtures/configfiles-extends" },
        ],
      });
      var errModulePath = path.resolve(
        __dirname,
        "./fixtures/configfiles-extends/throws.js",
      );
      assert.throws(
        () => app.prepare({}, function () {}),
        (err) => err.message.includes(errModulePath),
      );
    });
  });
});
