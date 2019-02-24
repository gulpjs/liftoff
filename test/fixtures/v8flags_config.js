var Liftoff = require('../..');

var Test = new Liftoff({
  name: 'test',
  v8flags: ['--harmony'],
});

Test.on('respawn', function(flags, proc) {
  console.log('saw respawn', flags);
});

Test.launch({
  forcedFlags: ['--lazy'],
}, function(env, argv) {
  console.error(argv.slice(1).join(' '));
});
