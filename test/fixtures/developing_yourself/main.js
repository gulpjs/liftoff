var Liftoff = require('../../..');

var app0 = new Liftoff({
  name: 'app0'
});

app0.launch({}, function(env) {
  console.log(JSON.stringify(env.modulePackage));
  console.log(env.modulePath);
  console.log(env.cwd);
});
