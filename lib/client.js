var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;


module.exports = Client;

function Client (port, host) {
  var self = this;
  EventEmitter.call(self);
  // protect constructor
  if (!(self instanceof Client)) return new Client(port, host);

  self.init(port, host);
}

util.inherits(Client, EventEmitter);

Client.prototype.init = function (port, host) {
  var self = this;

  // events handlers

  function connected () { self.emit('connected'); }
  function data (data) { self.emit('data', data); }
  function error (err) { self.emit('error', err); }
  function disconnected () { self.emit('disconnected'); }

  self.client = net.connect({port: port, host: host}, connected);

  // events

  self.client.on('data', data);
  self.client.on('error', error);
  self.client.on('close', disconnected);
};

Client.prototype.send = function (msg) {
  var self = this;
  self.client.write(msg + '\n');
};

Client.prototype.close = function () {
  var self = this;
  self.client.end();
};