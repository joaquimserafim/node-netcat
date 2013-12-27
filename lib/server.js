var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;


module.exports = Server;

function Server () {
  var self = this;
  EventEmitter.call(self);

  if (!(self instanceof Server)) return new Server();
  
  self.clients = {};
}

util.inherits(Server, EventEmitter);

Server.prototype.send = function (msg, cb) {
  var self = this;
  self.server.write(msg + '\n', cb);
};

Server.prototype.close = function () {
  var self = this;
  self.server.close();
};

Server.prototype.init = function (port) {
  var self = this;

  function handler (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations

    socket.setKeepAlive(true, 86400000);// 1 day
    socket.setTimeout(3600000);// 1 hour

    // client events handlers

    function data (data) { self.emit('data', data); }
    function timeout () { socket.destroy(); }
    function close () { delete self.clients[client]; } 

    // client events

    socket.on('data', data);
    socket.on('timeout', timeout);
    socket.on('close', close);
  }

  self.server = net.createServer(handler);

  // server events handlers

  function listening () { self.emit('ready'); }
  function conn (socket) { self.clients[socket.remoteAddress + ':' + socket.remotePort] = socket; }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }

  // server events

  self.server.on('listening', listening);
  self.server.on('connection', conn);
  self.server.on('close', close);
  self.server.on('error', error);

  self.server.listen(port);
};