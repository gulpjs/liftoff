module.exports = function () {
  var extensions;
  if (require.extensions) {
    extensions = Object.keys(require.extensions);
  } else {
    extensions = ['.js'];
  }
  return extensions;
};
