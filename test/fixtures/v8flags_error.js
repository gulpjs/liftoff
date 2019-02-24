var Liftoff = require('../..');

var Test = new Liftoff({
  name: 'test',
  v8flags: function(cb) {
    process.nextTick(function() {
      cb(new Error('v8flags error!'), ['--lazy']);
    })
  }
});
Test.on('respawn', function(flags, proc) {
  console.log('saw respawn');
});

Test.launch({}, function(env) {
  console.error(process.execArgv.join(''));
});
