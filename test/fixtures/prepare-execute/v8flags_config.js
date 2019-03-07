var Liftoff = require('../../..');

var Test = new Liftoff({
  name: 'test',
  v8flags: ['--harmony'],
});

Test.on('respawn', function(flags, proc) {
  console.log('saw respawn', flags);
});

Test.prepare({
  forcedFlags: ['--lazy'],
}, function(env) {
  Test.execute(env, function(env, argv) {
    console.error(argv.slice(1).join(' '));
  });
});
