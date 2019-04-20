var Liftoff = require('../../..');

var app0 = new Liftoff({
  name: 'app0'
});

app0.prepare({}, function(env) {
  app0.execute(env, function(env) {
    console.log(JSON.stringify(env.modulePackage));
    console.log(env.modulePath);
    console.log(env.cwd);
  });
});
