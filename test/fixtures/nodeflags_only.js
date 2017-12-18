const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
});

Test.on('respawn', function(execArgv) {
  console.log('saw respawn', execArgv);
});

Test.launch({
  forcedFlags: function(env) {
    return ['--lazy'];
  },
}, function(env, argv) {
  console.error(argv.slice(1).join(' '));
});
