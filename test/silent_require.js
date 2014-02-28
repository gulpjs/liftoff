const expect = require('chai').expect;
const silentRequire = require('../lib/silent_require');

describe('silentRequire', function () {
  it('should require a file', function () {
    expect(silentRequire('../package')).to.deep.equal(require('../package'));
  });
  it('should not throw if file is not found', function () {
    expect(silentRequire('path/to/nowhere')).to.not.throw
  });
});
