var Liftoff = require('../../..');

var Test = new Liftoff({
  name: 'test',
});

Test.on('respawn', function(execArgv) {
  console.log('saw respawn', execArgv);
});

Test.prepare({
  forcedFlags: function(env) {
    return ['--lazy'];
  },
}, function(env) {
  Test.execute(env, function(env, argv) {
    console.error(argv.slice(1).join(' '));
  });
});
