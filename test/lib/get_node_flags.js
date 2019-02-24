var expect = require('chai').expect;
var getNodeFlags = require('../../lib/get_node_flags');

describe('getNodeFlags', function() {

  describe('arrayOrFunction', function() {
    it('should return the first argument when it is an array', function() {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction([], env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(['--lazy', '--use_strict', '--harmony'], env))
        .to.has.members(['--lazy', '--harmony', '--use_strict']);
    });

    it('should return the exection result of the first argument when it is a function', function() {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction(function() {
        return [];
      }, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(function(arg) {
        expect(arg).to.equal(env);
        return ['--lazy', '--harmony'];
      }, env)).to.has.members(['--lazy', '--harmony']);
    });

    it('should return an array which has an element of the first argument when the first argument is a string', function() {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction('--lazy', env)).to.has.members(['--lazy']);
    });

    it('should return an empty array when the first argument is neither an array, a function nor a string', function() {
      var env = { cwd: 'aaa' };
      expect(getNodeFlags.arrayOrFunction(undefined, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(null, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(true, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(false, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(0, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction(123, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction({}, env)).to.has.members([]);
      expect(getNodeFlags.arrayOrFunction({ length: 1 }, env)).to.has.members([]);
    });
  });

  describe('fromReorderedArgv', function() {
    it('should return only node flags from respawning arguments', function() {
      var env = { cwd: 'aaa' };
      var cmd = ['node', '--lazy', '--harmony', '--use_strict', './aaa/bbb/app.js', '--ccc', 'ddd', '-e', 'fff'];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).to.deep.equal(['--lazy', '--harmony', '--use_strict']);
    });

    it('should end node flags before "--"', function() {
      var env = { cwd: 'aaa' };
      var cmd = ['node', '--lazy', '--', '--harmony', '--use_strict', './aaa/bbb/app.js', '--ccc', 'ddd', '-e', 'fff'];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).to.deep.equal(['--lazy']);

    });

    it('should return node flags when arguments are only node flags', function() {
      var env = { cwd: 'aaa' };
      var cmd = ['node', '--lazy', '--harmony', '--use_strict'];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).to.deep.equal(['--lazy', '--harmony', '--use_strict']);
    });

    it('should return an empty array when no node flags', function() {
      var env = { cwd: 'aaa' };
      var cmd = ['node', './aaa/bbb/app.js', '--aaa', 'bbb', '-c', 'd'];
      expect(getNodeFlags.fromReorderedArgv(cmd, env)).to.deep.equal([]);
    });
  });
});
