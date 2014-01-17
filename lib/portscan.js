var _ = require('underscore');
var json = require('./ports.json');
var Client = require('./client');
var UDP = require('./udp_client');


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

  function connect (port, host, cb) {
    var client = new Client(port, host, {timeout: 1000, read_encoding: 'ascii'});
    var udp = new UDP(port, host, {type: 'udp4', timeout: 1000, read_encoding: 'ascii'});

    function msg (desc) {
      if (!desc) desc = {port: port, svc: null, desc: null};

      return 'Connection ON to ' + host + 
        ' port ' + port + 
        ' [' + desc.prot + 
        '/' + desc.svc + 
        '/' + desc.desc + ']';
    }

    function tcpStatus () {
      var desc = _.find(json, function cb_find (obj) { 
        return obj.prot === 'tcp' && obj.port === port; 
      });

      // communicate and close the connection
      client.send('qwerty', true, function cb_call () {
        // return main callback
        cb(null, msg(desc));
      });
    }

    function udpStatus () {
      var udp_answer = null;

      // tx
      udp.send('qwerty');

      // hope rx something
      udp.on('data', function cb_data (data) {
        udp_answer = data;
      });

      udp.on('close', function () {
        if (!udp_answer) return error('connect ETIMEDOUT', 'udp');

        var desc = _.find(json, function cb_find (obj) { 
          return obj.prot === 'udp' && obj.port === port; 
        });

        // return main callback
        cb(null, msg(desc));
      });
      
    }

    // error - return main callback
    function error (err, protocol) {
      cb('Connection OFF to ' + 
        host + ' port ' + 
        port + ', protocol "' + 
        protocol + '" with message "' + 
        err + '"'
      );
    }


    // only use open and error events
    client.on('open', tcpStatus);
    client.on('error', function cb_error (err) {
      return error(err.message, 'tcp');
    });

    udp.on('open', udpStatus);
    udp.on('error', function cb_error (err) {
      return error(err.message, 'udp');
    });
    
    // start tcp client
    client.start();

    // start udp
    udp.start();
  }

  // iterate the ports list 
  _.each(list_ports, function calls (port) { connect(port, host, cb); });
}