var expect = require('expect');

var arrayFind = require('../lib/array_find');

describe('buildConfigName', function () {
  it('returns undefined if called with non-array', function (done) {
    expect(arrayFind({})).toEqual(undefined);
    done();
  });
});
