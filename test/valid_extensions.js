const expect = require('chai').expect;
const validExtensions = require('../lib/valid_extensions.js');

describe('validExtensions', function () {
  it('should return extensions that node currently knows how to load', function () {
    expect(validExtensions()).to.deep.equal(['.js','.json','.node']);
    require.extensions['.cows'] = function(){};
    expect(validExtensions()).to.deep.equal(['.js','.json','.node','.cows']);
    delete require.extensions['.cows'];
  });

  it('should allow explicit addition of extensions', function () {
    expect(validExtensions(['rc'])).to.deep.equal(['rc','.js','.json','.node']);
  });
});
