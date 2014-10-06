const path = require('path');
const expect = require('chai').expect;
const findConfig = require('../../lib/find_config');

describe('findConfig', function () {

  it('should throw if searchPaths or configNameRegex are empty when configName isn\'t explicltly provided', function () {
    expect(function(){findConfig();}).to.throw;
    expect(function(){findConfig({searchPaths:['../']});}).to.throw;
    expect(function(){findConfig({configNameRegex:'dude'});}).to.throw;
  });

  it('if configPath is explicitly provided, return the absolute path to the file or null if it doesn\'t actually exist', function () {
    var configPath = path.resolve('test/fixtures/mochafile.js');
    expect(findConfig({configPath:configPath})).to.equal(configPath);
    expect(findConfig({configPath:'path/to/nowhere'})).to.equal(null);
  });

  it('should return the absolute path to the first config file found in searchPaths', function () {
    expect(findConfig({
      configNameSearch: ['mochafile.js', 'mochafile.coffee'],
      searchPaths: ['test/fixtures']
    })).to.equal(path.resolve('test/fixtures/mochafile.js'));
    expect(findConfig({
      configNameSearch: ['mochafile.js', 'mochafile.coffee'],
      searchPaths: ['test/fixtures/search_path', 'test/fixtures/coffee']
    })).to.equal(path.resolve('test/fixtures/search_path/mochafile.js'));
  });

  it('should traverse symlinks', function () {
    expect(findConfig({
      configNameSearch: ['mochafile.js'],
      searchPaths: ['test/fixtures/symlink']
    })).to.equal(path.resolve('test/fixtures/mochafile.js'));
  });

});
