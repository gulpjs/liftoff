"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");
var path = require("node:path");

var fileSearch = require("../lib/file_search");

describe("fileSearch", function () {
  it("should locate a file using findup from an array of possible base paths", function () {
    assert.strictEqual(fileSearch("mochafile.js", ["../"]), null);
    assert.strictEqual(
      fileSearch("package.json", [process.cwd()]),
      path.resolve(__dirname, "..", "package.json"),
    );
  });
});
