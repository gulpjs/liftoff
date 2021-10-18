var path = require('path');

var expect = require('expect');

var findCwd = require('../lib/find_cwd');

describe('findCwd', function () {

  it('should return process.cwd if no options are passed', function (done) {
    expect(findCwd()).toEqual(process.cwd());
    done();
  });

  it('should return path from cwd if supplied', function (done) {
    expect(findCwd({ cwd: '../' })).toEqual(path.resolve('../'));
    done();
  });

  it('should return directory of config if configPath defined', function (done) {
    expect(findCwd({ configPath: 'test/fixtures/mochafile.js' })).toEqual(path.resolve('test/fixtures'));
    done();
  });

  it('should return path from cwd if both it and configPath are defined', function (done) {
    expect(findCwd({ cwd: '../', configPath: 'test/fixtures/mochafile.js' })).toEqual(path.resolve('../'));
    done();
  });

  it('should ignore cwd if it isn\'t a string', function (done) {
    expect(findCwd({ cwd: true })).toEqual(process.cwd());
    done();
  });

  it('should ignore configPath if it isn\'t a string', function (done) {
    expect(findCwd({ configPath: true })).toEqual(process.cwd());
    done();
  });

});
