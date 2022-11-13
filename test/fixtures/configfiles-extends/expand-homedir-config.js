var os = require('os');
var path = require('path');

var absolutePath = path.join(__dirname, './extend-config');
var relativePath = path.relative(os.homedir(), absolutePath);

if (relativePath !== absolutePath) {
  relativePath = '~' + path.sep + relativePath;
}

module.exports = {
  extends: relativePath,
  aaa: 'AAA',
};
