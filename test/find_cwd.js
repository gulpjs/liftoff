"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");
var path = require("node:path");

var findCwd = require("../lib/find_cwd");

describe("findCwd", function () {
  it("should return process.cwd if no options are passed", function () {
    assert.strictEqual(findCwd(), process.cwd());
  });

  it("should return path from cwd if supplied", function () {
    assert.strictEqual(findCwd({ cwd: "../" }), path.resolve("../"));
  });

  it("should return directory of config if configPath defined", function () {
    assert.strictEqual(
      findCwd({ configPath: "test/fixtures/mochafile.js" }),
      path.resolve("test/fixtures"),
    );
  });

  it("should return path from cwd if both it and configPath are defined", function () {
    assert.strictEqual(
      findCwd({ cwd: "../", configPath: "test/fixtures/mochafile.js" }),
      path.resolve("../"),
    );
  });

  it("should ignore cwd if it isn't a string", function () {
    assert.strictEqual(findCwd({ cwd: true }), process.cwd());
  });

  it("should ignore configPath if it isn't a string", function () {
    assert.strictEqual(findCwd({ configPath: true }), process.cwd());
  });
});
