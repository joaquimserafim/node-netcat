var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports.client = client;

function client (msg, port, host, cb) {
  if (!cb || typeof cb !== 'function') cb = function () {};

  var buffer = new Buffer(msg + '\n');

  var client = dgram.createSocket('udp4');

  client.send(buffer, 0, buffer.length, port, host, function (err, bytes) {
    cb(err, bytes);
    client.close();
  });
}


function Server (port, host, socket_type) {
  if (!(this instanceof Server)) return new Server(port, host, socket_type);
  EventEmitter.call(this);
  Server.init.call(this, port, host, socket_type);
}

util.inherits(Server, EventEmitter);

Server.init = function (port, host, socket_type) {
  var self = this;

  self._port = port || 4500;
  self._host = host || 'localhost';
  self._socketType = socket_type || 'udp4';

  self._server = dgram.createSocket(self._socketType);


  // events callabcks

  function message (msg, rinfo) { self.emit('data', msg, rinfo); }
  function listening () { self.emit('ready'); }
  function close () { self.emit('close');}
  function error (err) { self.emit('error', err); }


  // events
  self._server.on('message', message);
  self._server.on('listening', listening);
  self._server.on('close', close);
  self._server.on('error', error);
};

Server.prototype.bind = function (cb) {
  var self = this;
  if (!cb) = function () {};

  self._server.bind(self._port, self._host, cb);
};