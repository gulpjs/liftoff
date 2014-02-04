const test = require('tap').test;
const Liftoff = require('../');

const NAME = 'tap';

var app = new Liftoff({
  processTitle: NAME,
  configName: NAME+'file',
  moduleName: NAME
});

test('constructor', function (t) {

  test('the "name" option can auto-set processTitle, moduleName & configFile', function (t) {
    var alt = new Liftoff({name:NAME});
    t.equal(alt.processTitle, NAME);
    t.equal(alt.configName, NAME+'file');
    t.deepEqual(alt.moduleName, NAME);
    t.end();
  });

  test('sets a title to be used for the process at launch', function (t) {
    t.equal(app.processTitle, NAME);
    t.throws(function () {
      new Liftoff();
    }, new Error('You must specify a processTitle.'), 'throws if not provided');
    t.end();
  });

  test('sets the configuration file to look for at launch', function (t) {
    t.equal(app.configName, NAME+'file');
    t.throws(function () {
      new Liftoff({processTitle:NAME});
    }, new Error('You must specify a configName.'), 'throws if not provided');
    t.end();
  });

  test('sets local module to resolve at launch', function (t) {
    t.equal(app.moduleName, NAME);
    t.end();
  });

  test('sets a cli option to support changing the cwd', function (t) {
    var alt = new Liftoff({
      name: NAME,
      cwdFlag: 'cwd2'
    });
    t.equal(app.cwdFlag, 'cwd', 'defaults to "cwd"');
    t.equal(alt.cwdFlag, 'cwd2');
    t.end();
  });

  test('sets a cli option to support pre-loading modules', function (t) {
    var alt = new Liftoff({
      name: NAME,
      preloadFlag: 'require2'
    });
    t.equal(app.preloadFlag, 'require', 'defaults to "require"');
    t.equal(alt.preloadFlag, 'require2');
    t.end();
  });

  t.end();
});

test('launch(fn)', function (t) {
  var called = false;
  app.launch(function() {
    called = true;
  });
  t.ok(called, 'invokes a provided callback after preparing environment');
  t.throws(function() {
    app.launch();
  }, 'throws if no callback is provided');

  test('prepares an application environment', function (t) {
    app.launch(function () {

    });
    t.end();
  });
  t.end();
});
