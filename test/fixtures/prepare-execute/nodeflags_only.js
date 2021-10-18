var Liftoff = require('../../..');

var Test = new Liftoff({
  name: 'test',
});

Test.on('respawn', function (execArgv) {
  console.log('saw respawn', execArgv);
});

Test.prepare({}, function (env) {
  var forcedFlags = ['--lazy'];
  Test.execute(env, forcedFlags, function (env, argv) {
    console.error(argv.slice(1).join(' '));
  });
});
