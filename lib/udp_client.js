var dgram = require('dgram');

module.exports = Client;

function Client (msg, port, host, cb) {
  if (!cb || typeof cb !== 'function') cb = function () {};

  var buffer = new Buffer(msg + '\n');

  var client = dgram.createSocket('udp4');

  client.send(buffer, 0, buffer.length, port, host, function (err, bytes) {
    cb(err, bytes || buffer.length);// version 0.11 don't have bytes arg
    client.close();
  });
}