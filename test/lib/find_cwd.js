const expect = require('chai').expect;
const findCwd = require('../../lib/find_cwd');
const path = require('path');

describe('findCwd', function () {

  it('should return process.cwd if no options are passed', function () {
    expect(findCwd()).to.equal(process.cwd());
  });

  it('should return path from cwd if supplied', function () {
    expect(findCwd({cwd:'../'})).to.equal(path.resolve('../'));
  });

  it('should return directory of config if configPath defined', function () {
    expect(findCwd({configPath:'test/fixtures/mochafile.js'})).to.equal(path.resolve('test/fixtures'));
  });

  it('should return path from cwd if both it and configPath are defined', function () {
    expect(findCwd({cwd:'../',configPath:'test/fixtures/mochafile.js'})).to.equal(path.resolve('../'));
  });

  it('should ignore cwd if it isn\'t a string', function () {
    expect(findCwd({cwd:true})).to.equal(process.cwd());
  });

  it('should ignore configPath if it isn\'t a string', function () {
    expect(findCwd({configPath:true})).to.equal(process.cwd());
  });

});
