var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Server;

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

  function message (msg, rinfo) { 
    self.emit('data', msg.toString().replace(/\n$/, ''), 
      {port: rinfo.port, host: rinfo.address}, 
      rinfo.family.toLowerCase()); 
  }
  function listening () { self.emit('ready'); }
  function close () { self.emit('close');}
  function error (err) { self.emit('error', err); }


  // events
  self._server.on('message', message);
  self._server.on('listening', listening);
  self._server.on('close', close);
  self._server.on('error', error);
};

Server.prototype.send = function (msg, client) {
  var self = this;
  var buffer = new Buffer(msg + '\n');
  self._server.send(buffer, 0, buffer.length, client.port, client.host, function (err, bytes) {
    console.log(err, bytes);
  });
};

Server.prototype.close = function () {
  this._server.close();
  return 1;
};

Server.prototype.bind = function (cb) {
  if (!cb) cb = function () {};
  this._server.bind(this._port, this._host, cb);
};