'use strict'

var util = require('util')

module.exports = NetcatError

function NetcatError(error) {
  Error.call(this)
  Error.captureStackTrace(this, this.constructor)

  if (error instanceof Error) {
    error = util.format('%s: %s', error.name, error.message)
  }

  this.name     = this.constructor.name
  this.message  = error
}

util.inherits(NetcatError, Error)
