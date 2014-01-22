var _ = require('underscore');
var json = require('./ports.json');
var TCP = require('./client');
var UDP = require('./udp_client');
var lasync = require('lasync');


module.exports = PortScan;

function PortScan () {
  var self = this;
  if (!(self instanceof PortScan)) return new PortScan();
}

PortScan.prototype.run = function (host, scan, done) {

  function connect (cb) {
    var port = ports.shift();

    // error - return main callback
    function error (err, protocol) {
      return 'Connection OFF to ' + 
        host + ' port ' + 
        port + ', protocol "' + 
        protocol + '" with message "' + 
        err + '"';
    }

    function runUdp (next) {
      var udp = new UDP(port, host, {type: 'udp4', timeout: 1000, read_encoding: 'ascii'});

      var udp_answer = null;

      // rx something
      udp.on('data', function cb_data (data) {
        udp_answer = data;
        console.log(data);
        udp.close();
      });

      udp.on('open', function cb_open() {
        udp.send('qwerty');
      });

      udp.on('error', function cb_error (err) {
        next(null, error(err.message, 'udp'));
      });

      udp.on('close', function () {
        if (!udp_answer) return next(null, error('connect ETIMEDOUT', 'udp'));

        var desc = _.find(json, function cb_find (obj) { 
          return obj.prot === 'udp' && obj.port === port; 
        });

        // return main callback
        next(null, udp_answer);
      });

      udp.start();
    }

    function runTcp (next) {

      next(null, '1212');
    }

    lasync.series([runUdp, runTcp], function (err, result) {
      cb(err, result);
    });

  }

  return;

  // get port start and port end
  var scan_value = _.map(scan.split('-'), function cb_map (value) { return value | 0; });
  var ports =  _.range(_.min(scan_value), _.max(scan_value) + 1);

  // create the list of ports to be scanned
  var tasks = _.map(ports, function (port) {
    return _.bind(connect);
  });


  lasync.series(tasks, function (err, result) {
    done(err, result);
  });

}

var scan = PortScan();

scan.run('google.com', '80-81', function (err, res) {
  // will fail in port 81
  console.log('finish', err, res);
});



