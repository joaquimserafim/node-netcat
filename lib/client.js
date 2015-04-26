'use strict';

var net           = require('net');
var inherits      = require('util').inherits;
var EventEmitter  = require('events').EventEmitter;
var _             = require('underscore');
var ut            = require('./util');

module.exports = Client;

function Client(port, host, options) {
  if (!(this instanceof Client)) {
    return new Client(port, host, options);
  }

  EventEmitter.call(this);
  Client.init.call(this, port, host, options);
}

inherits(Client, EventEmitter);

Client.init = function(port, host, options) {
  if (!parseInt(port)) {
    throw new Error('in node-nc server the port is mandatory!');
  }

  // check args
  if (_.isObject(host)) {
    options = host;
    host = 'localhost';
  }

  this._port          = port;
  this._host          = host || 'localhost';
  this._readEncoding  = options && options.readEncoding;
  this._timeout       = (options && options.timeout) || 30000;
  this._asStream      = (options && options.asStream) || false;
};

Client.prototype.start = function() {
  var self = this;
  //
  // events handlers
  //
  function connect() {
    self.emit('open');
  }

  function data(chunk) {
    self.emit('data', chunk);
  }

  function error(err) {
    self.emit('error', err);
  }

  function close() {
    self.emit('close');
  }

  function timeout() {
    self._client.destroy();
    self.emit('error', {message: 'connect ETIMEDOUT'});
  }

  this._client = net.connect({
    port: self._port,
    host: self._host
  }, connect);

  // to receive buffer
  if (this._readEncoding) {
    this._client.setEncoding(this._readEncoding);
  }

  this._client.setTimeout(this._timeout);

  //
  // register events
  //

  process.nextTick(function register() {
    this._client.on('data', data);
    this._client.on('error', error);
    this._client.on('timeout', timeout);
    this._client.on('close', close);
  }, this);

  // want pass has a stream
  if (this.asStream) {
    return this._client;
  }
};

Client.prototype.send = function(msg, end, cb) {
  if (typeof end === 'function') {
    cb = end;
    end = false;
  }

  cb = cb || ut.noop;

  // send null
  if (!msg) {
    msg = new Buffer([0x00]);
  }

  if (msg && !Buffer.isBuffer(msg)) {
    msg = new Buffer(msg);
  }

  // send and close connection
  if (end) {
    this._client.end(msg);
    cb();
  } else {
    this._client.write(msg || '', cb);
  }
};

Client.prototype.close = function() {
  this._client.end();
};
