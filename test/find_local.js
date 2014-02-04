const test = require('tap').test;
const findLocal = require('../lib/find_local.js');
const path = require('path');

test('resolves a node module from a provided base directory', function (t) {
  t.throws(function() {
    findLocal('tap', '/');
  }, new Error("Cannot find module 'tap' from '/'"));
  t.doesNotThrow(function() {
    findLocal('tap', process.cwd());
  });
  t.end();
});
