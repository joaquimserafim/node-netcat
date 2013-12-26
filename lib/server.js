var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;


module.exports = Server;

function Server (port) {
  var self = this;
  EventEmitter.call(self);
  // protect constructor
  if (!(self instanceof Server)) return new Server(port);

  self.clients = {};
  self.init(port);
}

util.inherits(Server, EventEmitter);

Server.prototype.init = function (port) {
  var self = this;

  self.server = net.createServer(function (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations
    socket.setKeepAlive(true, 86400000);// 1 day
    socket.setTimeout(3600000);// 1 hour

    // client events

    socket.on('timeout', function () { socket.destroy(); });
    socket.on('close', function () { delete self.clients[client]; });
    socket.on('data', function (data) { self.emit('data', data); });
  });

  // server events

  self.server.on('listening', function () { self.emit('ready'); });
  self.server.on('connection', function (socket) { self.clients[socket.remoteAddress + ':' + socket.remotePort] = socket; });
  self.server.on('error', function (err) { self.emit('error', err); });
  self.server.on('close', function () { self.emit('close'); });

  self.server.listen(port);
};

Server.prototype.send = function (msg) {
  var self = this;
  self.server.write(msg + '\n');
};