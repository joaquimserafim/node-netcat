var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;


module.exports = Client;

function Client (port, host, options) {
  var self = this;
  EventEmitter.call(self);

  if (!(self instanceof Client)) return new Client(port, host, options);

  self._port = port || 5000;
  self._host = host || 'localhost';
  self._encoding = (options && options.encoding) || 'ascii';
  self._timeout = (options && options.timeout) || 30000;
}

util.inherits(Client, EventEmitter);

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
  self._client.setEncoding(self._encoding);
  self._client.setTimeout(self._timeout);

  // events

  self._client.on('data', data);
  self._client.on('error', error);
  self._client.on('timeout', timeout);
  self._client.on('close', close);
};

Client.prototype.send = function (msg, cb) {
  var self = this;
  self._client.write(msg, self._encoding, cb);
};

Client.prototype.end = function (msg) {
  var self = this;
  self._client.end(msg, self._encoding);
};