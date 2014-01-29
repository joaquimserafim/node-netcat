var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');


module.exports = Server;

function Server (port, host, options) {
  if (!(this instanceof Server)) return new Server(port, host, options);
  EventEmitter.call(this);
  Server.init.call(this, port, host, options);
}

util.inherits(Server, EventEmitter);

Server.init = function (port, host, options) {
  var self = this;
  // check args
  if (_.isObject(host)) {
    options = host;
    host = 'localhost';
  }
  
  self._clients = {};
  self._port = port;
  self._host = host || 'localhost';
  self._readEncoding = options && options.read_encoding;
  self._writeEncoding = (options && options.write_encoding) || 'ascii';
  self.timeout = (options && options.timeout) || 3600000;

  function handler (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations

    socket.setKeepAlive(true, 60000);
    socket.setTimeout(self._timeout);

    // to receive buffer
    if (self._readEncoding) self._client.setEncoding(self._readEncoding);

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
  this._server.listen(this._port, this._host);
  return true;
};

Server.prototype.close = function () {
  this._server.close();
  return true;
};

Server.prototype.send = function (client, msg, end, cb) {
  // check callback
  if (typeof end === 'function') {
    cb = end;
    end = false;
  }

  if (!cb) cb = function () {};

  // check client exists
  if (!_.contains(_.keys(this._clients), client)) return cb(null);

  // send and close connection
  if (end) {
    this._clients[client].end(msg, this._writeEncoding);
    return cb(null);
  }

  // or only send
  this._clients[client].write(msg, this._writeEncoding, cb);
  return 1;
};

Server.prototype.getClients = function () {
  return _.keys(this._clients);
};