'use strict'

module.exports = {
  noop: noop
}

function noop() {
  return function() {}
}
