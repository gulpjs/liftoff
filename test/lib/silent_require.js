var expect = require('chai').expect;
var path = require('path');
var silentRequire = require('../../lib/silent_require');

describe('silentRequire', function() {

  it('should require a file', function() {
    expect(silentRequire(path.resolve('./package'))).to.deep.equal(require('../../package'));
  });

  it('should not throw if file is not found', function() {
    expect(function() {
      silentRequire('path/to/nowhere');
    }).to.not.throw();
  });

});
