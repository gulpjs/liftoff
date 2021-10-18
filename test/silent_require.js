var path = require('path');

var expect = require('expect');

var silentRequire = require('../lib/silent_require');

describe('silentRequire', function () {

  it('should require a file', function (done) {
    expect(silentRequire(path.resolve('./package'))).toEqual(require('../package'));
    done();
  });

  it('should not throw if file is not found', function (done) {
    expect(function () {
      silentRequire('path/to/nowhere');
    }).not.toThrow();
    done();
  });
});
