var path = require("node:path");
var assert = require("node:assert");
var { describe, it } = require("node:test");

var silentRequire = require("../lib/silent_require");

describe("silentRequire", function () {
  it("should require a file", function () {
    assert.strictEqual(
      silentRequire(path.resolve("./package")),
      require("../package"),
    );
  });

  it("should not throw if file is not found", function () {
    assert.doesNotThrow(function () {
      silentRequire("path/to/nowhere");
    });
  });
});
