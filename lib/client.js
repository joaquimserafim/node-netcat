var net = require('net');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');


module.exports = Client;

function Client (port, host, options) {
  if (!(this instanceof Client)) return new Client(port, host, options);
  EventEmitter.call(this);
  Client.init.call(this, port, host, options);
}

inherits(Client, EventEmitter);


Client.init = function (port, host, options) {
  // check args
  if (_.isObject(host)) {
    options = host;
    host = 'localhost';
  }

  this._port = port || 5000;
  this._host = host || 'localhost';
  this._readEncoding = options && options.readEncoding;
  this._timeout = (options && options.timeout) || 30000;
  this._asStream = (options && options.asStream) || false;
};

Client.prototype.start = function () {
  var self = this;

  // events handlers

  function connect () { self.emit('open'); }
  function data (msg) { self.emit('data', msg); }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }
  function timeout () { 
    self._client.destroy();
    self.emit('error', {message: 'connect ETIMEDOUT'});
  }

  this._client = net.connect({port: self._port, host: self._host}, connect);

  // to receive buffer
  if (self._readEncoding) self._client.setEncoding(self._readEncoding);

  this._client.setTimeout(self._timeout);

  // events

  this._client.on('data', data);
  this._client.on('error', error);
  this._client.on('timeout', timeout);
  this._client.on('close', close);

  // want pass has a stream
  if (this.asStream) return this._client;
};

Client.prototype.send = function (msg, end, cb) {
  if (typeof end === 'function') {
    cb = end;
    end = false;
  }

  // send null
  if(!msg) msg = new Buffer([0x00]);

  if (_.isNumber(msg)) msg = msg.toString();

  if (msg && !Buffer.isBuffer(msg)) msg = new Buffer(msg);

  // check callback
  if (!cb) cb = function () {};

  // send and close connection
  if (end) {
    this._client.end(msg);
    cb();
    return 1;
  }

  // or only send
  this._client.write(msg || '', cb);
  return 1;
};
