const expect = require('chai').expect;
const parseOptions = require('../../lib/parse_options');
const NAME = 'mocha';
const opts = parseOptions({name:NAME});

describe('parseOptions', function () {

  it('should auto-set processTitle, moduleName, & configFile if `name` is provided.', function () {
    expect(opts.processTitle).to.equal(NAME);
    expect(opts.configName).to.equal(NAME+'file');
    expect(opts.moduleName).to.equal(NAME);
  });

  it('should set a title to be used for the process at launch', function () {
    expect(opts.processTitle).to.equal(NAME);
    expect(function () {
      parseOptions();
    }).throws('You must specify a processTitle.');
  });

  it('should set the configuration file to look for at launch', function () {
    expect(opts.configName).to.equal(NAME+'file');
    expect(function () {
      parseOptions({processTitle:NAME});
    }).throws('You must specify a configName.');
  });

  it('should set a local module to resolve at launch', function () {
    expect(opts.moduleName).to.equal(NAME);
  });

});
