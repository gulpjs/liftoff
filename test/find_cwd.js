const test = require('tap').test;
const findCwd = require('../lib/find_cwd.js');
const path = require('path');

test('resolves the current working directory', function (t) {
  t.equal(findCwd(), process.cwd());
  t.end();
});

test('resolves the current working directory from a relative path', function (t) {
  t.equal(findCwd('../'), path.resolve(process.cwd(), '../'));
  t.end();
});
