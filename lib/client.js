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

Client.prototype.init = function (port, host) {
  var self = this;

  // events handlers

  function connect () { self.emit('connect'); }
  function data (data) { self.emit('data', data); }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }

  self.client = net.connect({port: port, host: host}, connect);

  // events

  self.client.on('data', data);
  self.client.on('error', error);
  self.client.on('close', close);
};

Client.prototype.send = function (msg, cb) {
  var self = this;
  self.client.write(msg + '\n', cb);
};

Client.prototype.end = function (msg) {
  var self = this;
  self.client.end(msg);
};