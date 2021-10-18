var Liftoff = require('../../..');

var Test = new Liftoff({
  name: 'test',
  v8flags: ['--lazy'],
});
Test.on('respawn', function (flags, proc) {
  console.log('saw respawn');
});

Test.prepare({}, function (env) {
  Test.execute(env, function (env) {
    console.error(process.execArgv.join(''));
  });
});
