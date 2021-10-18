'use strict';

function needsLookup(xtends) {
  if (typeof xtends === 'string' && xtends[0] === '.') {
    return true;
  }

  if (isPlainObject(xtends)) {
    // Objects always need lookup because they can't be used with `require()`
    return true;
  }

  return false;
}

module.exports = needsLookup;
