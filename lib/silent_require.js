module.exports = function (path) {
  try {
    return require(path);
  } catch {
    // Failures are ignored
  }
};
