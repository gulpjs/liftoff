const expect = require('chai').expect;
const parseOptions = require('../lib/parse_options');

const NAME = 'mocha';
const opts = parseOptions({name:NAME});

describe('parseOptions', function () {

  it('should auto-set processTitle, moduleName, configFile & configPathFlag if `name` is provided.', function () {
    expect(opts.processTitle).to.equal(NAME);
    expect(opts.configName).to.equal(NAME+'file');
    expect(opts.moduleName).to.equal(NAME);
    expect(opts.configPathFlag).to.equal(NAME+'file');
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

  it('should set a cli flag for explicitly specifying a config location', function () {
    var alt = parseOptions({name: NAME, configPathFlag: 'alt'});
    expect(opts.configPathFlag).to.equal(NAME+'file');
    expect(alt.configPathFlag).to.equal('alt');
  });

  it('should set a cli flag to support changing the cwd', function () {
    var alt = parseOptions({name: NAME, cwdFlag: 'alt'});
    expect(opts.cwdFlag).to.equal('cwd'); // default
    expect(alt.cwdFlag).to.equal('alt');
  });

  it('should set a cli flag to support pre-loading modules', function () {
    var alt = parseOptions({name: NAME, preloadFlag: 'alt'});
    expect(opts.preloadFlag).to.equal('require'); // default
    expect(alt.preloadFlag).to.equal('alt');
  });

  it('should set a cli flag to support completions', function () {
    var alt = parseOptions({name: NAME, completionFlag: 'alt'});
    expect(opts.completionFlag).to.equal('completion'); // default
    expect(alt.completionFlag).to.equal('alt');
  });

});
