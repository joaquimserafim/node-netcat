var dgram         = require('dgram');
var inherits      = require('util').inherits;
var EventEmitter  = require('events').EventEmitter;

module.exports = Client;

function Client(port, host, options) {
  if (!(this instanceof Client)) {
    return new Client(port, host, options);
  }

  EventEmitter.call(this);
  Client.init.call(this, port, host, options);
}

inherits(Client, EventEmitter);

Client.init = function(port, host, options) {
  var self = this;

  self._port = port | 0;
  self._host = host || 'localhost';
  self._timeout = (options && options.timeout) || 0;
  self._readEncoding = options && options['read_encoding'];

  self._client = dgram.createSocket((options && options.type) || 'udp4');

  self._open = false;

  // events callabcks

  function message(msg, rinfo) {
    self._open = true;
    msg = self._readEncoding ?
      msg.toString(self._readEncoding) :
      msg;

    self.emit('data', msg, {
      port: rinfo.port,
      host: rinfo.address
    },
    rinfo.family.toLowerCase());
  }
  // udp don't have any handshaking dialogues,
  // open event it's merely representative in this
  function listening() {
    self.emit('open');
  }

  function close() {
    self.emit('close');
  }

  function error(err) {
    self.emit('error', err);
  }

  // events
  this._client.on('message', message);
  this._client.on('listening', listening);
  this._client.on('close', close);
  this._client.on('error', error);

  // timeout
  if (this._timeout) {
    setTimeout(function() {
      self.close();
    }, self._timeout);
  }
};

Client.prototype.send = function(msg, cb) {
  var self = this;
  var buffer = new Buffer(msg + '\n');
  this._client.send(buffer, 0, buffer.length, self._port, self._host, cb);
};

Client.prototype.close = function() {
  this._client.close();
  return 1;
};

Client.prototype.start = function() {
  this.send('qwerty', function(err) {
    if (err) {
      return 0;
    }
    return 1;
  });
};
