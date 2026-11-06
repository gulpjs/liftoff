var assert = require("node:assert");
var { describe, it } = require("node:test");

var parseOptions = require("../lib/parse_options");

var NAME = "mocha";

describe("parseOptions", function () {
  it("should auto-set processTitle, moduleName, & configFile if `name` is provided", function () {
    var opts = parseOptions({ name: NAME });
    assert.strictEqual(opts.processTitle, NAME);
    assert.strictEqual(opts.configName, NAME + "file");
    assert.strictEqual(opts.moduleName, NAME);
  });

  it("should set a title to be used for the process at launch", function () {
    var opts = parseOptions({ name: NAME });
    assert.strictEqual(opts.processTitle, NAME);
    assert.throws(
      function () {
        parseOptions();
      },
      { message: "You must specify a processTitle." },
    );
  });

  it("should set the configuration file to look for at launch", function () {
    var opts = parseOptions({ name: NAME });
    assert.strictEqual(opts.configName, NAME + "file");
    assert.throws(
      function () {
        parseOptions({ processTitle: NAME });
      },
      { message: "You must specify a configName." },
    );
  });

  it("should set a local module to resolve at launch", function () {
    var opts = parseOptions({ name: NAME });
    assert.strictEqual(opts.moduleName, NAME);
  });

  it("should use .processTitle/.configName/.moduleName preferentially", function () {
    var opts = parseOptions({
      name: "a",
      processTitle: "b",
      configName: "c",
      moduleName: "d",
    });
    assert.strictEqual(opts.processTitle, "b");
    assert.strictEqual(opts.configName, "c");
    assert.strictEqual(opts.moduleName, "d");
  });

  it("should throw error if opts does not have .name and .moduleName", function () {
    assert.throws(function () {
      parseOptions({
        processTitle: "a",
        configName: "b",
      });
    });
  });

  it("should throw error if opts is null or empty", function () {
    assert.throws(function () {
      parseOptions(null);
    });

    assert.throws(function () {
      parseOptions(undefined);
    });

    assert.throws(function () {
      parseOptions({});
    });
  });
});
