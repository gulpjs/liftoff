const Liftoff = require('../../../..');

const app1 = new Liftoff({
  name: 'app1'
});

app1.launch({}, function(env) {
  console.log(env.modulePackage);
  console.log(env.modulePath);
  console.log(env.cwd);
});
