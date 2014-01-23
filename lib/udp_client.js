var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Client;

function Client (port, host, options) {
  if (!(this instanceof Client)) return new Client(port, host, options);
  EventEmitter.call(this);
  Client.init.call(this, port, host, options);
}

util.inherits(Client, EventEmitter);

Client.init = function (port, host, options) {
  var self = this;

  self._port = port|0;
  self._host = host || 'localhost';
  self._timeout = (options && options.timeout) || 0;
  self._readEncoding = options && options.read_encoding;

  self._client = dgram.createSocket((options && options.type) || 'udp4');

  self._open = false;

  // events callabcks

  function message (msg, rinfo) { 
    self._open = true;
    var msg = self._readEncoding ? msg.toString(self._readEncoding) : msg;

    self.emit('data', 
      msg, 
      {port: rinfo.port, host: rinfo.address}, 
      rinfo.family.toLowerCase()
    ); 
  }
  // udp don't have any handshaking dialogues, open event it's merely representative in this
  function listening () { self.emit('open'); }
  function close () { self.emit('close');}
  function error (err) { self.emit('error', err); }


  // events
  self._client.on('message', message);
  self._client.on('listening', listening);
  self._client.on('close', close);
  self._client.on('error', error);


  // timeout
  if (self._timeout) {
    setTimeout(function cb_setTimeout () {
      self.close();
    }, self._timeout);
  }
};

Client.prototype.send = function (msg) {
  var self = this;
  var buffer = new Buffer(msg + '\n');
  self._client.send(buffer, 0, buffer.length, self._port, self._host, function (err, bytes) {
    if (err) throw err;
  });
};

Client.prototype.close = function () {
  this._client.close();
}

Client.prototype.start = function () {
  this.send('qwerty');
};