const Liftoff = require('../..');

const Test = new Liftoff({
  name: 'test',
  v8flags: ['--harmony'],
  nodeFlags: function(opts, env) {
    return ['--lazy'];
  },
});

Test.on('respawn', function(proc) {
  console.log('saw respawn');
});

Test.launch({}, function(env) {
  console.error(process.execArgv.join(' '));
});
