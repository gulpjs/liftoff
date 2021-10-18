var expect = require('expect');

var buildConfigName = require('../lib/build_config_name');

describe('buildConfigName', function () {
  it('should throw if no configName is provided', function (done) {
    expect(function () {
      buildConfigName();
    }).toThrow();
    done();
  });

  it('should use configName directly if it is a regex', function (done) {
    var configNameSearch = /mocha/;
    expect(buildConfigName({ configName: configNameSearch })).toEqual([
      configNameSearch,
    ]);
    done();
  });

  it('should throw if no array of extensions are provided and config is not a regex already', function (done) {
    expect(function () {
      buildConfigName({ configName: 'foo' });
    }).toThrow();
    expect(function () {
      buildConfigName({ configName: 'foo', extensions: '?' });
    }).toThrow();
    expect(function () {
      buildConfigName({ configName: 'foo', extensions: ['.js'] });
    }).not.toThrow();
    done();
  });

  it('should build an array of possible config names', function (done) {
    var multiExtension = buildConfigName({
      configName: 'foo',
      extensions: ['.js', '.coffee'],
    });
    expect(multiExtension).toEqual(['foo.js', 'foo.coffee']);
    var singleExtension = buildConfigName({
      configName: 'foo',
      extensions: ['.js'],
    });
    expect(singleExtension).toEqual(['foo.js']);
    done();
  });

  it('should throw error if opts is null or empty', function (done) {
    expect(function () {
      buildConfigName();
    }).toThrow();
    expect(function () {
      buildConfigName(null);
    }).toThrow();
    expect(function () {
      buildConfigName({});
    }).toThrow();
    done();
  });

  it('should throw error if .configName is null', function (done) {
    expect(function () {
      buildConfigName({ extensions: ['.js'] });
    }).toThrow();
    done();
  });

  it('should throw error if .extension is not an array', function (done) {
    expect(function () {
      buildConfigName({ configName: 'foo' });
    }).toThrow();
    expect(function () {
      buildConfigName({ configName: 'foo', extensions: null });
    }).toThrow();
    expect(function () {
      buildConfigName({ configName: 'foo', extensions: '.js' });
    }).toThrow();
    done();
  });
});
