'use strict'

var net         = require('net')
var inherits    = require('util').inherits
var EE          = require('events').EventEmitter
var _           = require('underscore')
var isJsObject  = require('is-js-object')
var ut          = require('./util')
var NetcatError = require('./error')

module.exports = Server

function Server (port, host, options) {
  if (!(this instanceof Server)) {
    return new Server(port, host, options)
  }

  EE.call(this)
  Server.init.call(this, port, host, options)
}

inherits(Server, EE)

Server.init = function init (port, host, options) {
  var self = this

  if (!parseInt(port)) {
    throw new NetcatError('the port is required')
  }

  // check args
  if (isJsObject(host)) {
    options = host
    host    = 'localhost'
  }

  this._clients = {}
  this._port    = port
  this._host    = host || 'localhost'
  this._timeout = (options && options.timeout) || 3600000

  function handler (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort

    // socket configurations
    socket.setKeepAlive(true, 60000)
    socket.setTimeout(this._timeout)

    if (options && options.readEncoding) {
      socket.setEncoding(options.readEncoding)
    }

    //
    // client events handlers
    //

    function data (chunk) {
      self.emit('data', client, chunk)
    }

    function timeout () {
      socket.destroy()
    }

    function error (err, cl, chunk) {
      self.emit('client_error', err, cl, chunk)
    }

    function close () {
      self.emit('client_off', client)
      delete self._clients[client]
    }

    //
    // register the client events
    //

    socket.on('data', data)
    socket.on('timeout', timeout)
    socket.on('error', error)
    socket.on('close', close)
  }

  this._server = net.createServer(handler)

  //
  // server events handlers
  //

  function listening () {
    self.emit('ready')
  }

  function error (err) {
    self.emit('error', err)
  }

  function close () {
    self.emit('close')
  }

  function conn (socket) {
    self._clients[socket.remoteAddress + ':' + socket.remotePort] = socket
    self.emit('client_on', socket.remoteAddress + ':' + socket.remotePort)
  }

  //
  // register the server events
  //

  this._server.on('listening', listening)
  this._server.on('connection', conn)
  this._server.on('close', close)
  this._server.on('error', error)
}

Server.prototype.listen = function listen () {
  this._server.listen(this._port, this._host)
}

Server.prototype.close = function close (cb) {
  cb = cb || ut.noop
  this._server.close(cb)
}

Server.prototype.send = function send (client, msg, end, cb) {
  if (typeof end === 'function') {
    cb = end
    end = false
  } else {
    cb = cb || ut.noop
  }

  msg = msg || new Buffer([0x00])

  if (!Buffer.isBuffer(msg)) {
    msg = new Buffer(msg.toString())
  }

  // check client exists
  if (_.contains(_.keys(this._clients), client)) {
    // client exists
    // send and close connection
    if (end) {
      this._clients[client].end(msg)
      cb()
    } else {
      this._clients[client].write(msg, cb)
    }
  } else {
    this._clients[client].emit('error',
      new Error(),
      client,
      msg)
    cb()
  }
}

Server.prototype.getClients = function getClients () {
  return _.keys(this._clients)
}
