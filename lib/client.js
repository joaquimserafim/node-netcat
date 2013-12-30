var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;


module.exports = Client;

function Client () {
  var self = this;
  EventEmitter.call(self);

  if (!(self instanceof Client)) return new Client();
}

util.inherits(Client, EventEmitter);

Client.prototype.init = function (port, host, options) {
  var self = this;

  self._encoding = (options && options.encoding) || 'ascii';

  // events handlers

  function connect () { self.emit('open'); }
  function data (data) { self.emit('data', data); }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }
  function timeout () { 
    self._client.destroy();
    self.emit('error', {message: 'connect ETIMEDOUT'});
  }

  self._client = net.connect({port: port, host: host}, connect);
  self._client.setEncoding(self._encoding);
  self._client.setTimeout((options && options.timeout) || 30000);

  // events

  self._client.on('data', data);
  self._client.on('error', error);
  self._client.on('timeout', timeout);
  self._client.on('close', close);
};

Client.prototype.send = function (msg, cb) {
  var self = this;
  self._client.write(msg + '\n', self._encoding, cb);
};

Client.prototype.end = function (msg) {
  var self = this;
  self._client.end(msg, self._encoding);
};