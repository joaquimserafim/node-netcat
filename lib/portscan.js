var _ = require('underscore');
var json = require('./ports.json');
var Client = require('./client');


module.exports = PortScan;

function PortScan () {
  var self = this;
  if (!(self instanceof PortScan)) return new PortScan();
}

PortScan.prototype.run = function (host, ports, cb) {
  // get port start and port end
  function findPorts (value) { return isNaN(value) ? value : parseInt(value, 10); }
  var r_ports = _.map(ports.split('-'), findPorts);

  // create the list of ports to be scanned
  var list_ports = _.range(_.min(r_ports), _.max(r_ports) + 1);

  // tcp client
  function connect (port, host, cb) {
    function open () {
      client.end();
      // for now only tcp
      var desc = _.find(json, function (obj) { return obj.prot === 'tcp' && obj.port === port; });
      cb(null, 'Connection ON to ' + host + ' port ' + port + ' [' + desc.prot + '/' + desc.svc + '/' + desc.desc + ']');
    }

    function error (err) {
      cb('Connection OFF to ' + host + ' port ' + port + ' with message "' + err.message + '"');
    }

    var client = new Client(port, host, {timeout: 1000});
    // only use open and error events
    client.on('open', open);
    client.on('error', error);
    // set a timeout of 1 second
    client.start();
  }

  // iterate the ports list 
  _.each(list_ports, function calls (port) { connect(port, host, cb); });
}