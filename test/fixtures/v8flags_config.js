const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  v8flags: ['--harmony'],
  nodeFlags: ['--lazy'],
});

Test.on('respawn', function(flags, proc) {
  console.log('saw respawn', flags);
});

Test.launch({}, function(env, argv) {
  console.error(argv.slice(1).join(' '));
});
