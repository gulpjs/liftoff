const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  v8flags: ['--stack_size']
});

Test.on('respawn', function (flags) {
  console.error(flags.join(' '));
});

Test.launch({}, function () {
});
