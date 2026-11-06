"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var buildConfigName = require("../lib/build_config_name");

describe("buildConfigName", function () {
  it("should throw if no configName is provided", function () {
    assert.throws(function () {
      buildConfigName();
    });
  });

  it("should use configName directly if it is a regex", function () {
    var configNameSearch = /mocha/;
    assert.deepStrictEqual(buildConfigName({ configName: configNameSearch }), [
      configNameSearch,
    ]);
  });

  it("should throw if no array of extensions are provided and config is not a regex already", function () {
    assert.throws(function () {
      buildConfigName({ configName: "foo" });
    });
    assert.throws(function () {
      buildConfigName({ configName: "foo", extensions: "?" });
    });
    assert.doesNotThrow(function () {
      buildConfigName({ configName: "foo", extensions: [".js"] });
    });
  });

  it("should build an array of possible config names", function () {
    var multiExtension = buildConfigName({
      configName: "foo",
      extensions: [".js", ".coffee"],
    });
    assert.deepStrictEqual(multiExtension, ["foo.js", "foo.coffee"]);
    var singleExtension = buildConfigName({
      configName: "foo",
      extensions: [".js"],
    });
    assert.deepStrictEqual(singleExtension, ["foo.js"]);
  });

  it("should throw error if opts is null or empty", function () {
    assert.throws(function () {
      buildConfigName();
    });
    assert.throws(function () {
      buildConfigName(null);
    });
    assert.throws(function () {
      buildConfigName({});
    });
  });

  it("should throw error if .configName is null", function () {
    assert.throws(function () {
      buildConfigName({ extensions: [".js"] });
    });
  });

  it("should throw error if .extension is not an array", function () {
    assert.throws(function () {
      buildConfigName({ configName: "foo" });
    });
    assert.throws(function () {
      buildConfigName({ configName: "foo", extensions: null });
    });
    assert.throws(function () {
      buildConfigName({ configName: "foo", extensions: ".js" });
    });
  });
});
