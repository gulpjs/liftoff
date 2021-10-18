var path = require('path');

var expect = require('expect');

var findConfig = require('../lib/find_config');

describe('findConfig', function () {
  it("should throw if searchPaths or configNameRegex are empty when configName isn't explicltly provided", function (done) {
    expect(function () {
      findConfig();
    }).toThrow();
    expect(function () {
      findConfig({ searchPaths: ['../'] });
    }).toThrow();
    expect(function () {
      findConfig({ configNameRegex: 'dude' });
    }).toThrow();
    done();
  });

  it("if configPath is explicitly provided, return the absolute path to the file or null if it doesn't actually exist", function (done) {
    var configPath = path.resolve('test/fixtures/mochafile.js');
    expect(findConfig({ configPath: configPath })).toEqual(configPath);
    expect(findConfig({ configPath: 'path/to/nowhere' })).toEqual(null);
    done();
  });

  it('should return the absolute path to the first config file found in searchPaths', function (done) {
    expect(
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
        searchPaths: ['test/fixtures'],
      })
    ).toEqual(path.resolve('test/fixtures/mochafile.js'));
    expect(
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      })
    ).toEqual(path.resolve('test/fixtures/search_path/mochafile.js'));
    expect(
      findConfig({
        configNameSearch: 'mochafile.js',
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      })
    ).toEqual(path.resolve('test/fixtures/search_path/mochafile.js'));
    done();
  });

  it('should throw error if .searchPaths is not an array', function (done) {
    expect(function () {
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
      });
    }).toThrow();
    expect(function () {
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
        searchPaths: null,
      });
    }).toThrow();
    expect(function () {
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
        searchPaths: 'test/fixtures/search_path',
      });
    }).toThrow();
    done();
  });

  it('should throw error if .configNameSearch is null', function (done) {
    expect(function () {
      findConfig({
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      });
    }).toThrow();
    expect(function () {
      findConfig({
        configNameSearch: null,
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      });
    }).toThrow();
    expect(function () {
      findConfig({
        configNameSearch: '',
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      });
    }).toThrow();
    done();
  });

  it('should throw error if opts is null or empty', function (done) {
    expect(function () {
      findConfig();
    }).toThrow();
    expect(function () {
      findConfig(null);
    }).toThrow();
    expect(function () {
      findConfig({});
    }).toThrow();
    done();
  });
});
