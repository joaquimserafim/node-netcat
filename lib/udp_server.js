var dgram = require('dgram');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

module.exports = Server;

function Server (port, host, socket_type) {
  if (!(this instanceof Server)) return new Server(port, host, socket_type);
  EventEmitter.call(this);
  Server.init.call(this, port, host, socket_type);
}

inherits(Server, EventEmitter);


Server.init = function (port, host, socket_type) {
  var self = this;

  this._port = port || 4500;
  this._host = host || 'localhost';
  this._socketType = socket_type || 'udp4';

  this._server = dgram.createSocket(this._socketType);


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
  this._server.on('message', message);
  this._server.on('listening', listening);
  this._server.on('close', close);
  this._server.on('error', error);
};

Server.prototype.send = function (msg, client, cb) {
  var buffer = new Buffer(msg + '\n');
  this._server.send(buffer, 0, buffer.length, client.port, client.host, cb);
};

Server.prototype.close = function () {
  this._server.close();
  return 1;
};

Server.prototype.bind = function (cb) {
  if (!cb) cb = function () {};
  this._server.bind(this._port, this._host, cb);
};
