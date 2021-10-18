var path = require('path');

var expect = require('expect');

var fileSearch = require('../lib/file_search');

describe('fileSearch', function () {

  it('should locate a file using findup from an array of possible base paths', function (done) {
    expect(fileSearch('mochafile.js', ['../'])).toEqual(null);
    expect(fileSearch('package.json', [process.cwd()])).toEqual(path.resolve(__dirname, '..', 'package.json'));
    done();
  });

});
