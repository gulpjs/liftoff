function omit(src, omitted) {
  if (!Array.isArray(omitted)) {
    omitted = [];
  }

  var dst = [];
  for (var i = 0; i < src.length; i++) {
    var elm = src[i];
    if (omitted.indexOf(elm) < 0) {
      dst.push(elm);
    }
  }
  return dst;
}

function find(src, founds) {
  if (!Array.isArray(founds)) {
    founds = [];
  }

  for (var i = 0; i < src.length; i++) {
    var elm = src[i];
    if (founds.indexOf(elm) >= 0) {
      return true;
    }
  }
  return false;
}

module.exports = {
  omit: omit,
  find: find,
};
