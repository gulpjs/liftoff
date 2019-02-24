var path = require('path');
var expect = require('chai').expect;
var findConfig = require('../../lib/find_config');

describe('findConfig', function() {

  it('should throw if searchPaths or configNameRegex are empty when configName isn\'t explicltly provided', function() {
    expect(function() { findConfig(); }).to.throw();
    expect(function() { findConfig({ searchPaths: ['../'] }); }).to.throw();
    expect(function() { findConfig({ configNameRegex: 'dude' }); }).to.throw();
  });

  it('if configPath is explicitly provided, return the absolute path to the file or null if it doesn\'t actually exist', function() {
    var configPath = path.resolve('test/fixtures/mochafile.js');
    expect(findConfig({ configPath: configPath })).to.equal(configPath);
    expect(findConfig({ configPath: 'path/to/nowhere' })).to.equal(null);
  });

  it('should return the absolute path to the first config file found in searchPaths', function() {
    expect(findConfig({
      configNameSearch: ['mochafile.js', 'mochafile.coffee'],
      searchPaths: ['test/fixtures'],
    })).to.equal(path.resolve('test/fixtures/mochafile.js'));
    expect(findConfig({
      configNameSearch: ['mochafile.js', 'mochafile.coffee'],
      searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
    })).to.equal(path.resolve('test/fixtures/search_path/mochafile.js'));
    expect(findConfig({
      configNameSearch: 'mochafile.js',
      searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
    })).to.equal(path.resolve('test/fixtures/search_path/mochafile.js'));
  });

  it('should throw error if .searchPaths is not an array', function() {
    expect(function() {
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
      });
    }).to.throw();
    expect(function() {
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
        searchPaths: null,
      });
    }).to.throw();
    expect(function() {
      findConfig({
        configNameSearch: ['mochafile.js', 'mochafile.coffee'],
        searchPaths: 'test/fixtures/search_path',
      });
    }).to.throw();
  });

  it('should throw error if .configNameSearch is null', function() {
    expect(function() {
      findConfig({
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      });
    }).to.throw();
    expect(function() {
      findConfig({
        configNameSearch: null,
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      });
    }).to.throw();
    expect(function() {
      findConfig({
        configNameSearch: '',
        searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee'],
      });
    }).to.throw();
  });

  it('should throw error if opts is null or empty', function() {
    expect(function() {
      findConfig();
    }).to.throw();
    expect(function() {
      findConfig(null);
    }).to.throw();
    expect(function() {
      findConfig({});
    }).to.throw();
  });
});
