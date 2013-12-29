var Server = require('./server');
var Client = require('./client');
var PortScan = require('./portscan');

module.exports = Netcat;

function Netcat () {
  var self = this;
  // protect constructor
  if (!(self instanceof Netcat)) return new Netcat();
}

Netcat.prototype.client = Client;
Netcat.prototype.server = Server;
Netcat.prototype.portscan = PortScan;