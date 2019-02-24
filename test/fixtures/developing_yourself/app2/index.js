var Liftoff = require('../../../..');

var app2 = new Liftoff({
  name: 'app2'
});

app2.launch({}, function(env) {
  console.log(JSON.stringify(env.modulePackage));
  console.log(env.modulePath);
  console.log(env.cwd);
});
