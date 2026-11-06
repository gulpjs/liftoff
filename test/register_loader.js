var path = require("node:path");
var util = require("node:util");
var EE = require("node:events").EventEmitter;
var assert = require("node:assert");
var { describe, it } = require("node:test");

var registerLoader = require("../lib/register_loader");

var testDir = path.resolve(__dirname, "./fixtures/register_loader");

function App() {
  EE.call(this);
}
util.inherits(App, EE);

function handlerNotEmit() {
  throw new Error("Should not have emitted");
}

describe("registerLoader", function () {
  describe("register loader", function () {
    it("Should emit a `loader:success` event when registering loader succeeds", function (t, done) {
      var loaderPath = path.join(testDir, "require-cfg.js");
      var configPath = path.join(testDir, "app.cfg");
      var extensions = { ".cfg": loaderPath };

      var app = new App();
      app.on("loader:success", function (moduleName /* , module */) {
        assert.strictEqual(moduleName, loaderPath);
        assert.strictEqual(require(configPath), "Load app.cfg by require-cfg");
        done();
      });
      app.on("loader:failure", handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });

    it("Should emit only a `loader:success` event when registering loader failed and succeeds", function (t, done) {
      var loaderPath = path.join(testDir, "require-conf.js");
      var configPath = path.join(testDir, "app.conf");
      var extensions = { ".conf": ["xxx", loaderPath] };

      var app = new App();
      app.on("loader:success", function (moduleName /* , module */) {
        assert.strictEqual(moduleName, loaderPath);
        assert.strictEqual(
          require(configPath),
          "Load app.conf by require-conf",
        );
        done();
      });
      app.on("loader:failure", handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });

    it("Should emit a `loader:failure` event when loader is not found", function (t, done) {
      var loaderPath = path.join(testDir, "require-tmp.js");
      var configPath = path.join(testDir, "app.tmp");
      var extensions = { ".tmp": ["xxx", loaderPath] };

      var app = new App();
      var index = 0;
      app.on("loader:failure", function (moduleName, error) {
        if (index === 0) {
          assert.strictEqual(moduleName, "xxx");
          assert.ok(error instanceof Error);
          assert.match(error.message, /Cannot find module/);
        } else if (index === 1) {
          assert.strictEqual(moduleName, loaderPath);
          assert.ok(error instanceof Error);
          assert.match(error.message, /Cannot find module/);
          done();
        } else {
          done(new Error("Should not call more than two times"));
        }
        index++;
      });
      app.on("loader:success", handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });

    it("Should emit a `loader:failure` event when registering loader failed", function (t, done) {
      var loaderPath = path.join(testDir, "require-fail.js");
      var configPath = path.join(testDir, "app.tmp");
      var extensions = { ".tmp": loaderPath };

      var app = new App();
      app.on("loader:failure", function (moduleName, error) {
        assert.strictEqual(moduleName, loaderPath);
        assert.ok(error instanceof Error);
        assert.match(error.message, /Fail to register!/);
        done();
      });
      app.on("loader:success", handlerNotEmit);

      registerLoader(app, extensions, configPath);
    });
  });

  describe("cwd", function () {
    it('Should use "cwd" as a base directory of loaded file path if specified', function (t, done) {
      var loaderPath = path.join(testDir, "require-rc.js");
      var configPath = "app.rc";
      var extensions = { ".rc": loaderPath };
      var app = new App();
      app.on("loader:success", function (moduleName /* , module */) {
        assert.strictEqual(moduleName, loaderPath);
        var loadedFile = path.join(testDir, configPath);
        assert.strictEqual(require(loadedFile), "Load app.rc by require-rc");
        done();
      });
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, extensions, configPath, testDir);
    });
  });

  describe("extensions", function () {
    it("Should do nothing when extensions is null", function () {
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app);
      registerLoader(app, null, "aaa/bbb.cfg");
      registerLoader(app, null, "aaa/bbb.cfg", ".");
      // .js is one of default extensions
      registerLoader(app, null, "aaa/bbb.js");
      registerLoader(app, null, "aaa/bbb.js", ".");
    });

    it("Should do nothing when extensions is illegal type", function () {
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, 123, "aaa/bbb.cfg");
      registerLoader(app, true, "aaa/bbb.cfg");
      registerLoader(app, function () {}, "aaa/bbb.cfg");
      registerLoader(app, [".rc", ".cfg"], "aaa/bbb.cfg");
      // .js is one of default extensions
      registerLoader(app, 123, "aaa/bbb.js");
      registerLoader(app, true, "aaa/bbb.js");
      registerLoader(app, function () {}, "aaa/bbb.js");
      registerLoader(app, [".js", ".json"], "aaa/bbb.js");
    });

    it("Should do nothing when extensions is a string", function () {
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, ".cfg", "aaa/bbb.cfg");
      registerLoader(app, ".js", "aaa/bbb.js");
    });
  });

  describe("configPath", function () {
    it("Should do nothing when configPath is null", function () {
      var extensions0 = [".js", ".json", ".coffee", ".coffee.md"];
      var extensions1 = {
        ".js": null,
        ".json": null,
        ".coffee": "coffee-script/register",
        ".coffee.md": "coffee-script/register",
      };
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, extensions0);
      registerLoader(app, extensions1);
      registerLoader(app, extensions0, null, ".");
      registerLoader(app, extensions1, null, ".");
    });

    it("Should do nothing when configPath is illegal type", function () {
      var extensions0 = [".js", ".json", ".coffee", ".coffee.md"];
      var extensions1 = {
        ".js": null,
        ".json": null,
        ".coffee": "coffee-script/register",
        ".coffee.md": "coffee-script/register",
      };
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, extensions0, 123);
      registerLoader(app, extensions0, ["aaa", "bbb"]);
      registerLoader(app, extensions1, {});
      registerLoader(app, extensions1, function () {});
    });

    it("Should do nothing when configPath does not end with one of extensions", function () {
      var loaderPath = path.join(testDir, "require-rc.js");
      var configPath = path.join(testDir, "app.xxx");
      var extensions = { ".cfg": loaderPath };
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, extensions, configPath);
    });

    it("Should do nothing when configPath ends with one of extensions of which the loader was already registered", function () {
      var loaderPath = path.join(testDir, "require-cfg.js");
      var configPath = path.join(testDir, "app.cfg");
      var extensions = { ".cfg": loaderPath };
      var app = new App();
      app.on("loader:success", handlerNotEmit);
      app.on("loader:failure", handlerNotEmit);
      registerLoader(app, extensions, configPath);
    });
  });

  describe("Multiple extensions", function () {
    it("should detect the shortest extension in extension candidates", function (t, done) {
      var loaderPath = path.join(testDir, "require-file-b.js");
      var configPath = path.join(testDir, "file.a.b");
      var extensions = { ".b": loaderPath };
      var app = new App();
      app.on("loader:failure", handlerNotEmit);
      app.on("loader:success", function (moduleName /* , module */) {
        assert.strictEqual(moduleName, loaderPath);
        assert.strictEqual(
          require(configPath),
          "Load file.a.b by require-file-b",
        );
        done();
      });
      registerLoader(app, extensions, configPath);
    });

    it("should detect not shortest extension in extension candidates", function (t, done) {
      var loaderPath = path.join(testDir, "require-file-bc.js");
      var configPath = path.join(testDir, "file.a.b.c");
      var extensions = { ".b.c": loaderPath };
      var app = new App();
      app.on("loader:failure", handlerNotEmit);
      app.on("loader:success", function (moduleName /* , module */) {
        assert.strictEqual(moduleName, loaderPath);
        assert.strictEqual(
          require(configPath),
          "Load file.a.b.c by require-file-bc",
        );
        done();
      });
      registerLoader(app, extensions, configPath);
    });

    it("Should update a loader of a longer extension but not update a loader of a shorter extension", function (t, done) {
      var loaderPathD = path.join(testDir, "require-file-d.js");
      var loaderPathCD = path.join(testDir, "require-file-cd.js");
      var loaderPathECD = path.join(testDir, "require-file-ecd.js");
      var loaderPathFCD = path.join(testDir, "require-file-fcd.js");
      var configPathD = path.join(testDir, "file.a.b.d");
      var configPathCD = path.join(testDir, "file.a.b.c.d");
      var configPathECD = path.join(testDir, "file.a.e.c.d");
      var configPathFCD = path.join(testDir, "file.a.f.c.d");
      var extensions = {
        ".d": loaderPathD,
        ".c.d": loaderPathCD,
        ".e.c.d": loaderPathECD,
        ".f.c.d": loaderPathFCD,
      };
      var count = 0;
      var app = new App();
      app.on("loader:failure", handlerNotEmit);
      app.on("loader:success", function (moduleName /* , module */) {
        switch (count) {
          case 0: {
            assert.strictEqual(moduleName, loaderPathCD);
            assert.strictEqual(
              require(configPathCD),
              "Load file.a.b.c.d by require-file-cd",
            );
            break;
          }
          case 1: {
            assert.strictEqual(moduleName, loaderPathECD);
            assert.strictEqual(
              require(configPathECD),
              "Load file.a.e.c.d by require-file-ecd",
            );
            break;
          }
          case 2: {
            assert.strictEqual(moduleName, loaderPathFCD);
            assert.strictEqual(
              require(configPathFCD),
              "Load file.a.f.c.d by require-file-fcd",
            );
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
