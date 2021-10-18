var Liftoff = require('../../..');

var Test = new Liftoff({
  name: 'test',
  v8flags: ['--stack_size'],
});

Test.on('respawn', function (flags) {
  console.error(flags.join(' '));
});

Test.prepare({}, function (env) {
  Test.execute(env, function () {});
});
