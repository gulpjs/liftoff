const expect = require('chai').expect;
const parseOptions = require('../../lib/parse_options');
const NAME = 'mocha';

describe('parseOptions', function () {

  it('should auto-set processTitle, moduleName, & configFile if `name` is provided.', function () {
    const opts = parseOptions({name:NAME});
    expect(opts.processTitle).to.equal(NAME);
    expect(opts.configName).to.equal(NAME+'file');
    expect(opts.moduleName).to.equal(NAME);
  });

  it('should set a title to be used for the process at launch', function () {
    const opts = parseOptions({name:NAME});
    expect(opts.processTitle).to.equal(NAME);
    expect(function () {
      parseOptions();
    }).to.throw('You must specify a processTitle.');
  });

  it('should set the configuration file to look for at launch', function () {
    const opts = parseOptions({name:NAME});
    expect(opts.configName).to.equal(NAME+'file');
    expect(function () {
      parseOptions({processTitle:NAME});
    }).to.throw('You must specify a configName.');
  });

  it('should set a local module to resolve at launch', function () {
    const opts = parseOptions({name:NAME});
    expect(opts.moduleName).to.equal(NAME);
  });

  it('should use .processTitle/.configName/.moduleName preferencially',
  function() {
    const opts = parseOptions({
      name: 'a',
      processTitle: 'b',
      configName: 'c',
      moduleName: 'd',
    });
    expect(opts.processTitle).to.equal('b');
    expect(opts.configName).to.equal('c');
    expect(opts.moduleName).to.equal('d');
  });

  it('should throw error if opts does not have .name and .moduleName',
  function() {
    expect(function() {
      parseOptions({
        processTitle: 'a',
        configName: 'b',
      });
    }).to.throw();
  });

  it('should throw error if opts is null or empty', function() {
    expect(function() { parseOptions(null); }).to.throw();
    expect(function() { parseOptions(undefined); }).to.throw();
    expect(function() { parseOptions({}); }).to.throw();
  });

});
