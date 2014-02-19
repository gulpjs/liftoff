const path = require('path');
const test = require('tap').test;
const Liftoff = require('../');


const NAME = 'tap';

var app = new Liftoff({
  processTitle: NAME,
  configName: NAME+'file',
  moduleName: NAME
});

var appAddExtensions = new Liftoff({
  processTitle: NAME,
  configName: NAME+'file',
  extensions: ['rc'],
  moduleName: NAME
});


test('constructor', function (t) {

  test('the "name" option auto-configures processTitle, moduleName, configFile & configLocationFlag', function (t) {
    var alt = new Liftoff({name:NAME});
    t.equal(alt.processTitle, NAME);
    t.equal(alt.configName, NAME+'file');
    t.deepEqual(alt.moduleName, NAME);
    t.deepEqual(alt.configLocationFlag, NAME+'file');
    t.end();
  });

  test('configures a title to be used for the process at launch', function (t) {
    t.equal(app.processTitle, NAME);
    t.throws(function () {
      new Liftoff();
    }, new Error('You must specify a processTitle.'), 'throws if not provided');
    t.end();
  });

  test('configures the configuration file to look for at launch', function (t) {
    t.equal(app.configName, NAME+'file');
    t.throws(function () {
      new Liftoff({processTitle:NAME});
    }, new Error('You must specify a configName.'), 'throws if not provided');
    t.end();
  });

  test('configures local module to resolve at launch', function (t) {
    t.equal(app.moduleName, NAME);
    t.end();
  });

  test('configures a cli flag for explicitly specifying a config location', function (t) {
    var alt = new Liftoff({
      name: NAME,
      configLocationFlag: 'alt'
    });
    t.equal(app.configLocationFlag, NAME+'file', 'defaults to "configName+file"');
    t.equal(alt.configLocationFlag, 'alt');
    t.end();
  });

  test('configures a cli flag to support changing the cwd', function (t) {
    var alt = new Liftoff({
      name: NAME,
      cwdFlag: 'alt'
    });
    t.equal(app.cwdFlag, 'cwd', 'defaults to "cwd"');
    t.equal(alt.cwdFlag, 'alt');
    t.end();
  });

  test('configures a cli flag to support pre-loading modules', function (t) {
    var alt = new Liftoff({
      name: NAME,
      preloadFlag: 'alt'
    });
    t.equal(app.preloadFlag, 'require', 'defaults to "require"');
    t.equal(alt.preloadFlag, 'alt');
    t.end();
  });

  test('configures a cli flag to support completions', function (t) {
    var alt = new Liftoff({
      name: NAME,
      completionFlag: 'alt'
    });
    t.equal(app.completionFlag, 'completion', 'defaults to "completion"');
    t.equal(alt.completionFlag, 'alt');
    t.end();
  });

  t.end();
});

test('launch(fn)', function (t) {
  var env = false;
  t.throws(function() {
    app.launch();
  }, 'throws if no callback is provided');
  app.launch(function() {
    env = this;
  }, {
    require: ['coffee-script/register'],
    cwd: './fixtures'
  });
  t.ok(env, 'invokes a provided callback with an environment');

  var expected = {
    settings: app,
    argv: {
      require: ['coffee-script/register'],
      cwd: './fixtures'
    },
    cwd: path.join(__dirname, 'fixtures'),
    preload: ['coffee-script/register'],
    validExtensions: [ '.js', '.json', '.node', '.coffee', '.litcoffee', '.coffee.md' ],
    configNameRegex: 'tapfile{.js,.json,.node,.coffee,.litcoffee,.coffee.md}',
    configPath: path.join(__dirname,'fixtures','Tapfile.js'),
    configBase: path.join(__dirname, 'fixtures'),
    modulePackage: require('../node_modules/tap/package.json'),
    modulePath: path.join(__dirname,'../node_modules/tap/lib/main.js')
  };
  t.deepEqual(env, expected);

  t.end();
});
