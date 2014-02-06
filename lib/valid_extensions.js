module.exports = function () {
  if (require.extensions) {
    return Object.keys(require.extensions);
  }
  return ['.js'];
};
