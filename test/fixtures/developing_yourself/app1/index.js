var Liftoff = require('../../../..');

var app1 = new Liftoff({
  name: 'app1'
});

app1.prepare({}, function(env) {
  app1.execute(env, function(env) {
    console.log(env.modulePackage);
    console.log(env.modulePath);
    console.log(env.cwd);
  });
});
