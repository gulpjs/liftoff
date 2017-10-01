const expect = require('chai').expect;
const buildConfigName = require('../../lib/build_config_name');

describe('buildConfigName', function () {

  it('should throw if no configName is provided', function () {
    expect(function(){buildConfigName();}).to.throw();
  });

  it('should use configName directly if it is a regex', function () {
    var configNameSearch = /mocha/;
    expect(buildConfigName({configName:configNameSearch})).to.deep.equal([configNameSearch]);
  });

  it('should throw if no array of extensions are provided and config is not a regex already', function () {
    expect(function(){buildConfigName({configName:'foo'});}).to.throw();
    expect(function(){buildConfigName({configName:'foo',extensions:'?'});}).to.throw();
    expect(function(){buildConfigName({configName:'foo',extensions:['.js']});}).to.not.throw();
  });

  it('should build an array of possible config names', function () {
    var multiExtension = buildConfigName({configName:'foo',extensions:['.js','.coffee']});
    expect(multiExtension).to.deep.equal(['foo.js', 'foo.coffee']);
    var singleExtension = buildConfigName({configName:'foo',extensions:['.js']});
    expect(singleExtension).to.deep.equal(['foo.js']);
  });

  it('should throw error if opts is null or empty', function() {
    expect(function() {
      buildConfigName();
    }).to.throw();
    expect(function() {
      buildConfigName(null);
    }).to.throw();
    expect(function() {
      buildConfigName({});
    }).to.throw();
  });

  it('should throw error if .configName is null', function() {
    expect(function() {
      buildConfigName({ extensions: ['.js'] });
    }).to.throw();
  });

  it('should throw error if .extension is not an array', function() {
    expect(function() {
      buildConfigName({ configName: 'foo' });
    }).to.throw();
    expect(function() {
      buildConfigName({ configName: 'foo', extensions: null });
    }).to.throw();
    expect(function() {
      buildConfigName({ configName: 'foo', extensions: '.js' });
    }).to.throw();
  });

});
