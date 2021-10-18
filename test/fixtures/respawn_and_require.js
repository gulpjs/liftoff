const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  v8flags: ['--harmony'],
});

Test.on('respawn', function (flags, proc) {
  console.log('saw respawn', flags);
});

Test.on('preload:success', function (name) {
  console.log('preload:success', name);
});

Test.prepare(
  {
    preload: 'coffeescript/register',
  },
  function (env) {
    var forcedFlags = ['--lazy'];
    Test.execute(env, forcedFlags, function () {
      console.log('execute');
    });
  }
);
