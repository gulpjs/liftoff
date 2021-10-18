var expect = require('expect');

var getNodeFlags = require('../lib/get_node_flags');

describe('getNodeFlags', function () {
  describe('arrayOrFunction', function () {
    it('should return the first argument when it is an array', function (done) {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction([], env)).toEqual([]);
      expect(
        getNodeFlags.arrayOrFunction(
          ['--lazy', '--use_strict', '--harmony'],
          env
        )
      ).toEqual(
        expect.arrayContaining(['--lazy', '--harmony', '--use_strict'])
      );
      done();
    });

    it('should return the exection result of the first argument when it is a function', function (done) {
      var env = { cwd: 'aaa' };
      expect(
        getNodeFlags.arrayOrFunction(function () {
          return [];
        }, env)
      ).toEqual([]);
      expect(
        getNodeFlags.arrayOrFunction(function (arg) {
          expect(arg).toEqual(env);
          return ['--lazy', '--harmony'];
        }, env)
      ).toEqual(expect.arrayContaining(['--lazy', '--harmony']));
      done();
    });

    it('should return an array which has an element of the first argument when the first argument is a string', function (done) {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction('--lazy', env)).toEqual(
        expect.arrayContaining(['--lazy'])
      );
      done();
    });

    it('should return an empty array when the first argument is neither an array, a function nor a string', function (done) {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction(undefined, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction(null, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction(true, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction(false, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction(0, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction(123, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction({}, env)).toEqual([]);
      expect(getNodeFlags.arrayOrFunction({ length: 1 }, env)).toEqual([]);
      done();
    });
  });

  describe('fromReorderedArgv', function () {
    it('should return only node flags from respawning arguments', function (done) {
      var env = { cwd: 'aaa' };
      var cmd = [
        'node',
        '--lazy',
        '--harmony',
        '--use_strict',
        './aaa/bbb/app.js',
        '--ccc',
        'ddd',
        '-e',
        'fff',
      ];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).toEqual([
        '--lazy',
        '--harmony',
        '--use_strict',
      ]);
      done();
    });

    it('should end node flags before "--"', function (done) {
      var env = { cwd: 'aaa' };
      var cmd = [
        'node',
        '--lazy',
        '--',
        '--harmony',
        '--use_strict',
        './aaa/bbb/app.js',
        '--ccc',
        'ddd',
        '-e',
        'fff',
      ];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).toEqual(['--lazy']);
      done();
    });

    it('should return node flags when arguments are only node flags', function (done) {
      var env = { cwd: 'aaa' };
      var cmd = ['node', '--lazy', '--harmony', '--use_strict'];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).toEqual([
        '--lazy',
        '--harmony',
        '--use_strict',
      ]);
      done();
    });

    it('should return an empty array when no node flags', function (done) {
      var env = { cwd: 'aaa' };
      var cmd = ['node', './aaa/bbb/app.js', '--aaa', 'bbb', '-c', 'd'];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).toEqual([]);
      done();
    });
  });
});
