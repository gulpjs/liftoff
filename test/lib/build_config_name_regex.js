const expect = require('chai').expect;
const buildConfigNameRegex = require('../../lib/build_config_name_regex');

describe('buildConfigNameRegex', function () {

  it('should throw if no configName is provided', function () {
    expect(function(){buildConfigNameRegex();}).to.throw;
  });

  it('should use configName directly if it is a regex', function () {
    var configNameRegex = /mocha/;
    expect(buildConfigNameRegex({configName:configNameRegex})).to.equal(configNameRegex);
  });

  it('should throw if no array of extensions are provided and config is not a regex already', function () {
    expect(function(){buildConfigNameRegex({configName:'foo'});}).to.throw;
    expect(function(){buildConfigNameRegex({configName:'foo',extensions:'?'});}).to.throw;
    expect(function(){buildConfigNameRegex({configName:'foo',extensions:['.js']});}).to.not.throw;
  });

  it('should build a string that can be used as a regular expression', function () {
    var multiExtension = buildConfigNameRegex({configName:'foo',extensions:['.js','.coffee']});
    expect(multiExtension).to.equal('foo{.js,.coffee}');
    var singleExtension = buildConfigNameRegex({configName:'foo',extensions:['.js']});
    expect(singleExtension).to.equal('foo.js');
  });

});
