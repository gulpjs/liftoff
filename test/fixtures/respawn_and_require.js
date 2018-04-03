const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  v8flags: ['--harmony'],
});

Test.on('respawn', function(flags, proc) {
  console.log('saw respawn', flags);
});

Test.on('require', function(name) {
  console.log('require', name);
});

Test.launch({
  require: 'coffeescript/register',
  forcedFlags: ['--lazy'],
}, function(env, argv) {
  console.log('execute');
});
