const test = require('tap').test;
const validExtensions = require('../lib/valid_extensions.js');

test('returns extensions that node currently knows how to load', function (t) {
  t.deepEqual(validExtensions(), ['.js','.json','.node']);
  t.end();

  require.extensions['.cows'] = function(){};
  t.deepEqual(validExtensions(), ['.js','.json','.node','.cows']);
  delete require.extensions['.cows'];
});

test('allows explicit addition of extensions', function (t) {
  t.deepEqual(validExtensions(['rc']), ['rc','.js','.json','.node']);
  t.end();
});
