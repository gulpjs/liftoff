const expect = require('chai').expect;
const array = require('../../lib/array');

describe('array', function() {

  describe('omit', function() {
    it('should omit elements in array', function() {
      expect(array.omit([1, 2, 3], [1, 3])).to.deep.equal([2]);
      expect(array.omit(['a'], ['a', 'b'])).to.deep.equal([]);
      expect(array.omit(['A', 'B', 'C'], ['B', 'D', 'E']))
        .to.deep.equal(['A', 'C']);
    });

    it('should not raise error for empty array', function() {
      expect(array.omit([], [])).to.deep.equal([]);
      expect(array.omit([], [1, 2, 3])).to.deep.equal([]);
    });

    it('should not raise error if 2nd arg is null', function() {
      expect(array.omit(['a', 'b', 'c'], null)).to.deep.equal(['a', 'b', 'c']);
      expect(array.omit([1, 2], undefined)).to.deep.equal([1, 2]);
    });
  });

  describe('find', function() {
    it('should return true if elements is found in array', function() {
      expect(array.find([1, 2, 3], [1, 3])).to.equal(true);
      expect(array.find(['a'], ['a', 'b'])).to.equal(true);
      expect(array.find(['A', 'B', 'C'], ['B', 'D', 'E'])).to.equal(true);
    });

    it('should return false if elements is not found in array', function() {
      expect(array.find([1, 2, 3], [4, 5])).to.equal(false);
      expect(array.find(['a'], ['b', 'c'])).to.equal(false);
      expect(array.find(['A', 'B', 'C'], ['Z', 'D', 'E'])).to.equal(false);
      expect(array.find(['A', 'B', 'C'], [])).to.equal(false);
    });

    it('should not raise error for empty array', function() {
      expect(array.find([], [])).to.deep.equal(false);
      expect(array.find([], [1, 2, 3])).to.deep.equal(false);
    });

    it('should not raise error if 2nd arg is null', function() {
      expect(array.find(['a', 'b', 'c'], null)).to.deep.equal(false);
      expect(array.find([1, 2], undefined)).to.deep.equal(false);
    });
  });

});
