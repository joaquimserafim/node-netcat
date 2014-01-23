var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;


module.exports = Client;

function Client (port, host, options) {
  if (!(this instanceof Client)) return new Client(port, host, options);
  EventEmitter.call(this);
  Client.init.call(this, port, host, options);
}

util.inherits(Client, EventEmitter);

Client.init = function (port, host, options) {
  var self = this;

  self._port = port || 5000;
  self._host = host || 'localhost';
  self._readEncoding = options && options.read_encoding;
  self._writeEncoding = (options && options.write_encoding) || 'ascii';
  self._timeout = (options && options.timeout) || 30000;
};

Client.prototype.start = function () {
  var self = this;

  // events handlers

  function connect () { self.emit('open'); }
  function data (data) { self.emit('data', data); }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }
  function timeout () { 
    self._client.destroy();
    self.emit('error', {message: 'connect ETIMEDOUT'});
  }

  self._client = net.connect({port: self._port, host: self._host}, connect);

  // to receive buffer
  if (self._readEncoding) self._client.setEncoding(self._readEncoding);

  self._client.setTimeout(self._timeout);

  // events

  self._client.on('data', data);
  self._client.on('error', error);
  self._client.on('timeout', timeout);
  self._client.on('close', close);
};

Client.prototype.send = function (msg, end, cb) {
  var self = this;
  // check callback
  if (typeof end === 'function') {
    cb = end;
    end = false;
  }

  if (!cb) cb = function () {};

  // send and close connection
  if (end) {
    self._client.end(msg, self._writeEncoding);
    return cb(null);
  }

  // or only send
  self._client.write(msg, self._writeEncoding, cb);
  return 1;
};