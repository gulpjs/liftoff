"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var arrayFind = require("../lib/array_find");

describe("buildConfigName", function () {
  it("returns undefined if called with non-array", function () {
    assert.strictEqual(arrayFind({}), undefined);
  });
});
