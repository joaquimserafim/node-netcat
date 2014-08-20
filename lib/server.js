var net = require('net');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');


module.exports = Server;

function Server (port, host, options) {
  if (!(this instanceof Server)) return new Server(port, host, options);
  EventEmitter.call(this);
  Server.init.call(this, port, host, options);
}

inherits(Server, EventEmitter);


Server.init = function (port, host, options) {
  var self = this;
  // check args
  if (_.isObject(host)) {
    options = host;
    host = 'localhost';
  }
  
  this._clients = {};
  this._port = port;
  this._host = host || 'localhost';
  this._readEncoding = options && options.readEncoding;
  this.timeout = (options && options.timeout) || 3600000;

  function handler (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations

    socket.setKeepAlive(true, 60000);
    socket.setTimeout(this._timeout);

    // to receive buffer
    if (this._readEncoding) socket.setEncoding(this._readEncoding);

    // client events handlers

    function data (data) {
      self.emit('data', client, data); }

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

  this._server.on('listening', listening);
  this._server.on('connection', conn);
  this._server.on('close', close);
  this._server.on('error', error);
};

Server.prototype.listen = function () {
  this._server.listen(this._port, this._host);
  return 1;
};

Server.prototype.close = function () {
  this._server.close();
  return 1;
};

Server.prototype.send = function (client, msg, end, cb) {
  if (typeof end === 'function') {
    cb = end;
    end = false;
  }

  // check callback
  if (!cb) cb = function () {};

  // send null
  if(!msg) msg = new Buffer([0x00]);

  if (_.isNumber(msg)) msg = msg.toString();

  if (msg && !Buffer.isBuffer(msg)) msg = new Buffer(msg.toString());

  // check client exists
  if (!_.contains(_.keys(this._clients), client)) return cb();

  // send and close connection
  if (end) {
    this._clients[client].end(msg);
    return cb();
  }

  // or only send
  this._clients[client].write(msg, cb);
  return 1;
};

Server.prototype.getClients = function () {
  return _.keys(this._clients);
};
