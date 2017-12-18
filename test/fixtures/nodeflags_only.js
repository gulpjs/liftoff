const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  nodeFlags: function(opts, env) {
    return ['--lazy'];
  },
});

Test.on('respawn', function(execArgv) {
  console.log('saw respawn', execArgv);
});

Test.launch({}, function(env, argv) {
  console.error(argv.slice(1).join(' '));
});
