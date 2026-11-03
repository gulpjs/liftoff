"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var getNodeFlags = require("../lib/get_node_flags");

describe("getNodeFlags", function () {
  describe("arrayOrFunction", function () {
    it("should return the first argument when it is an array", function () {
      var env = { cwd: "aaa" };
      assert.deepStrictEqual(
        getNodeFlags.arrayOrFunction(function () {
          return [];
        }, env),
        [],
      );
      var envFlags = getNodeFlags.arrayOrFunction(
        ["--lazy", "--use_strict", "--harmony"],
        env,
      );
      assert.strictEqual(envFlags.includes("--lazy"), true);
      assert.strictEqual(envFlags.includes("--use_strict"), true);
      assert.strictEqual(envFlags.includes("--harmony"), true);
    });

    it("should return the execution result of the first argument when it is a function", function () {
      var env = { cwd: "aaa" };
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction([], env), []);

      var result = getNodeFlags.arrayOrFunction(function (arg) {
        assert.deepStrictEqual(arg, env);
        return ["--lazy", "--harmony"];
      }, env);

      assert.strictEqual(result.includes("--lazy"), true);
      assert.strictEqual(result.includes("--harmony"), true);
    });

    it("should return an array which has an element of the first argument when the first argument is a string", function () {
      var env = { cwd: "aaa" };
      var envFlags = getNodeFlags.arrayOrFunction("--lazy", env);
      assert.strictEqual(envFlags.includes("--lazy"), true);
    });

    it("should return an empty array when the first argument is neither an array, a function nor a string", function () {
      var env = { cwd: "aaa" };
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction(undefined, env), []);
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction(null, env), []);
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction(true, env), []);
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction(false, env), []);
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction(0, env), []);
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction(123, env), []);
      assert.deepStrictEqual(getNodeFlags.arrayOrFunction({}, env), []);
      assert.deepStrictEqual(
        getNodeFlags.arrayOrFunction({ length: 1 }, env),
        [],
      );
    });
  });

  describe("fromReorderedArgv", function () {
    it("should return only node flags from respawning arguments", function () {
      var env = { cwd: "aaa" };
      var cmd = [
        "node",
        "--lazy",
        "--harmony",
        "--use_strict",
        "./aaa/bbb/app.js",
        "--ccc",
        "ddd",
        "-e",
        "fff",
      ];
      assert.deepStrictEqual(getNodeFlags.fromReorderedArgv(cmd, env), [
        "--lazy",
        "--harmony",
        "--use_strict",
      ]);
    });

    it('should end node flags before "--"', function () {
      var env = { cwd: "aaa" };
      var cmd = [
        "node",
        "--lazy",
        "--",
        "--harmony",
        "--use_strict",
        "./aaa/bbb/app.js",
        "--ccc",
        "ddd",
        "-e",
        "fff",
      ];
      assert.deepStrictEqual(getNodeFlags.fromReorderedArgv(cmd, env), [
        "--lazy",
      ]);
    });

    it("should return node flags when arguments are only node flags", function () {
      var env = { cwd: "aaa" };
      var cmd = ["node", "--lazy", "--harmony", "--use_strict"];
      assert.deepStrictEqual(getNodeFlags.fromReorderedArgv(cmd, env), [
        "--lazy",
        "--harmony",
        "--use_strict",
      ]);
    });

    it("should return an empty array when no node flags", function () {
      var env = { cwd: "aaa" };
      var cmd = ["node", "./aaa/bbb/app.js", "--aaa", "bbb", "-c", "d"];
      assert.deepStrictEqual(getNodeFlags.fromReorderedArgv(cmd, env), []);
    });
  });
});
