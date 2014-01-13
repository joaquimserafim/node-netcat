var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');


module.exports = Server;

function Server (port, options) {
  if (!(this instanceof Server)) return new Server(port, options);
  EventEmitter.call(this);
  Server.init.call(this, port, options);
}

util.inherits(Server, EventEmitter);

Server.init = function (port, options) {
  var self = this;
  
  self._clients = {};
  self._port = port || 5000;
  self._readEncoding = (options && options.read_encoding) || 'buffer';
  self._writeEncoding = (options && options.write_encoding) || 'ascii';
  self_timeout = (options && options.timeout) || 3600000;

  function handler (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations

    socket.setKeepAlive(true, 60000);
    socket.setTimeout(self._timeout);

    // to receive buffer
    if (self._readEncoding !== 'buffer') self._client.setEncoding(self._readEncoding);

    // client events handlers

    function data (data) { self.emit('data', client, data); }
    function timeout () { socket.destroy(); }
    function close () { 
      delete self._clients[client]; 
      self.emit('client_off', client);
    } 

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
    self.emit('client_on', socket.remoteAddress + ':' + socket.remotePort);
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

  // check client exists
  if (!_.contains(_.keys(self._clients), client)) return cb(null);

  // send and close connection
  if (end) {
    self._clients[client].end(msg, self._writeEncoding);
    return cb(null);
  }

  // or only send
  self._clients[client].write(msg, self._writeEncoding, cb);
};

Server.prototype.getClients = function () {
  var self = this;
  return _.keys(self._clients);
};