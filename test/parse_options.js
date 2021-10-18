var expect = require('expect');

var parseOptions = require('../lib/parse_options');

var NAME = 'mocha';

describe('parseOptions', function () {

  it('should auto-set processTitle, moduleName, & configFile if `name` is provided', function (done) {
    var opts = parseOptions({ name: NAME });
    expect(opts.processTitle).toEqual(NAME);
    expect(opts.configName).toEqual(NAME + 'file');
    expect(opts.moduleName).toEqual(NAME);
    done();
  });

  it('should set a title to be used for the process at launch', function (done) {
    var opts = parseOptions({ name: NAME });
    expect(opts.processTitle).toEqual(NAME);
    expect(function () {
      parseOptions();
    }).toThrow('You must specify a processTitle.');
    done();
  });

  it('should set the configuration file to look for at launch', function (done) {
    var opts = parseOptions({ name: NAME });
    expect(opts.configName).toEqual(NAME + 'file');
    expect(function () {
      parseOptions({ processTitle: NAME });
    }).toThrow('You must specify a configName.');
    done();
  });

  it('should set a local module to resolve at launch', function (done) {
    var opts = parseOptions({ name: NAME });
    expect(opts.moduleName).toEqual(NAME);
    done();
  });

  it('should use .processTitle/.configName/.moduleName preferencially',
    function (done) {
      var opts = parseOptions({
        name: 'a',
        processTitle: 'b',
        configName: 'c',
        moduleName: 'd',
      });
      expect(opts.processTitle).toEqual('b');
      expect(opts.configName).toEqual('c');
      expect(opts.moduleName).toEqual('d');
      done();
    });

  it('should throw error if opts does not have .name and .moduleName',
    function (done) {
      expect(function () {
        parseOptions({
          processTitle: 'a',
          configName: 'b',
        });
      }).toThrow();
      done();
    });

  it('should throw error if opts is null or empty', function (done) {
    expect(function () { parseOptions(null); }).toThrow();
    expect(function () { parseOptions(undefined); }).toThrow();
    expect(function () { parseOptions({}); }).toThrow();
    done();
  });
});
