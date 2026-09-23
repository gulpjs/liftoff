export function silentRequire(path) {
  try {
    return require(path);
  } catch (e) {}
};
