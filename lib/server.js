var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');


module.exports = Server;

function Server (port) {
  var self = this;
  EventEmitter.call(self);

  if (!(self instanceof Server)) return new Server(port);
  
  self._clients = {};
  self._port = port || 5000;

  // constructor
  self._init();
}

util.inherits(Server, EventEmitter);


Server.prototype._init = function () {
  var self = this;

  function handler (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations

    socket.setKeepAlive(true, 86400000);// 1 day
    socket.setTimeout(3600000);// 1 hour

    // client events handlers

    function data (data) { self.emit('data', client, data); }
    function timeout () { socket.destroy(); }
    function close () { delete self._clients[client]; } 

    // client events

    socket.on('data', data);
    socket.on('timeout', timeout);
    socket.on('close', close);
  }

  self._server = net.createServer(handler);

  // server events handlers

  function listening () { self.emit('ready'); }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }
  function conn (socket) { 
    self._clients[socket.remoteAddress + ':' + socket.remotePort] = socket;
    self.emit('client', socket.remoteAddress + ':' + socket.remotePort);
  }

  // server events

  self._server.on('listening', listening);
  self._server.on('connection', conn);
  self._server.on('close', close);
  self._server.on('error', error);
};

Server.prototype.listen = function () {
  var self = this;
   self._server.listen(self._port);
};

Server.prototype.close = function () {
  var self = this;
  self._server.close();
};

Server.prototype.send = function (client, msg, end, cb) {
  var self = this;
  // check callback
  if (typeof end === 'function') {
    cb = end;
    end = false;
  }

  if (!cb) cb = function () {};

  // close connection or only write
  if (end) {
    self._clients[client].end(msg + '\n');
    return cb(null);
  }
  
  self._clients[client].write(msg + '\n', cb);
};

Server.prototype.getClients = function () {
  var self = this;
  return _.keys(self._clients);
};
