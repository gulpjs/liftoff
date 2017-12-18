const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  v8flags: ['--lazy']
});
Test.on('respawn', function (flags, proc) {
  console.log('saw respawn');
});

Test.launch({}, function (env) {
  console.error(process.execArgv.join(''));
});
