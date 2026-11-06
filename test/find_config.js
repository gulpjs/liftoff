"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");
var path = require("node:path");

var findConfig = require("../lib/find_config");

describe("findConfig", function () {
  it("should throw if searchPaths or configNameRegex are empty when configName isn't explicltly provided", function () {
    assert.throws(function () {
      findConfig();
    });
    assert.throws(function () {
      findConfig({ searchPaths: ["../"] });
    });
    assert.throws(function () {
      findConfig({ configNameRegex: "dude" });
    });
  });

  it("if configPath is explicitly provided, return the absolute path to the file or null if it doesn't actually exist", function () {
    var configPath = path.resolve("test/fixtures/mochafile.js");
    assert.strictEqual(findConfig({ configPath: configPath }), configPath);
    assert.strictEqual(findConfig({ configPath: "path/to/nowhere" }), null);
  });

  it("should return the absolute path to the first config file found in searchPaths", function () {
    assert.strictEqual(
      findConfig({
        configNameSearch: ["mochafile.js", "mochafile.coffee"],
        searchPaths: ["test/fixtures"],
      }),
      path.resolve("test/fixtures/mochafile.js"),
    );
    assert.strictEqual(
      findConfig({
        configNameSearch: ["mochafile.js", "mochafile.coffee"],
        searchPaths: ["test/fixtures/search_path", "test/fixtures/coffee"],
      }),
      path.resolve("test/fixtures/search_path/mochafile.js"),
    );
    assert.strictEqual(
      findConfig({
        configNameSearch: "mochafile.js",
        searchPaths: ["test/fixtures/search_path", "test/fixtures/coffee"],
      }),
      path.resolve("test/fixtures/search_path/mochafile.js"),
    );
  });

  it("should throw error if .searchPaths is not an array", function () {
    assert.throws(function () {
      findConfig({
        configNameSearch: ["mochafile.js", "mochafile.coffee"],
      });
    });
    assert.throws(function () {
      findConfig({
        configNameSearch: ["mochafile.js", "mochafile.coffee"],
        searchPaths: null,
      });
    });
    assert.throws(function () {
      findConfig({
        configNameSearch: ["mochafile.js", "mochafile.coffee"],
        searchPaths: "test/fixtures/search_path",
      });
    });
  });

  it("should throw error if .configNameSearch is null", function () {
    assert.throws(function () {
      findConfig({
        searchPaths: ["test/fixtures/search_path", "test/fixtures/coffee"],
      });
    });
    assert.throws(function () {
      findConfig({
        configNameSearch: null,
        searchPaths: ["test/fixtures/search_path", "test/fixtures/coffee"],
      });
    });
    assert.throws(function () {
      findConfig({
        configNameSearch: "",
        searchPaths: ["test/fixtures/search_path", "test/fixtures/coffee"],
      });
    });
  });

  it("should throw error if opts is null or empty", function () {
    assert.throws(function () {
      findConfig();
    });
    assert.throws(function () {
      findConfig(null);
    });
    assert.throws(function () {
      findConfig({});
    });
  });
});
