
var net = require('net');
var json = require('./ports.json');
var Client = require('./client');

module.exports = PortScan;

function PortScan () {
  var self = this;

  if (!(self instanceof PortScan)) return new PortScan(host, ports);
}

PortScan.prototype.run = function (host, ports, cb) {
  var self = this;

  var client = new Client();

  client.init(ports, host, {timeout: 30000});

  client.on('open', function () {
    client.send('teste');
  });
  client.on('data', function (data) {
    cb(null, data);
    client.end();
  });
  client.on('error', cb)
  client.on('close', cb)
}