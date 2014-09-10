var _       = require('underscore');
var json    = require('./ports.json');
var TCP     = require('./client');
var UDP     = require('./udp_client');
var lasync  = require('lasync');

module.exports = PortScan;

function PortScan() {
  if (!(this instanceof PortScan)) {
    return new PortScan();
  }
}

PortScan.prototype.run = function(host, scan, done) {
  function connect(cb) {
    var port = ports.shift();

    // error - return main callback
    function errorMsg(err, protocol) {
      return 'Connection OFF to ' +
        host + ' port ' +
        port + ', protocol "' +
        protocol + '" with message "' +
        err + '"';
    }

    function respMsg(desc) {
      desc = desc || {prot: null, svc: null, desc: null};

      return 'Connection ON to ' + host +
        ' port ' + port +
        ' [' + desc.prot +
        '/' + desc.svc +
        '/' + desc.desc + ']';
    }

    function runUdp(next) {
      var udp = new UDP(port, host, {
        type: 'udp4',
        timeout: 1000,
        'read_encoding': 'ascii'
      });

      var udpAnswer = '';

      // rx something
      udp.on('data', function(data) {
        udpAnswer = data;
      });

      udp.on('open', function() {
        udp.send('qwerty');
      });

      udp.on('error', function(err) {
        next(null, {err: errorMsg(err.message, 'udp')});
      });

      udp.on('close', function() {
        if (!udpAnswer) {
          return next(null, {
            err: errorMsg('"connect ETIMEDOUT"', 'udp')
          });
        }

        var desc = _.find(json, function(obj) {
          return obj.prot === 'udp' && obj.port === port;
        });

        // return main callback
        next(null, {ok: respMsg(desc)});
      });

      udp.start();
    }

    function runTcp (next) {
      var tcp = new TCP(port, host, {
        timeout: 1000,
        'read_encoding': 'ascii'
      });

      var desc = _.find(json, function(obj) {
        return obj.prot === 'tcp' && obj.port === port;
      });

      // communicate and close the connection
      tcp.on('open', function() {
        tcp.send('qwerty', true, function() {
          // return main callback
          next(null, {ok: respMsg(desc)});
        });
      });

      tcp.on('error', function(err) {
        next(null, {err: errorMsg(err.message, 'tcp')});
      });

      tcp.on('close', function() {});
      tcp.start();
    }

    lasync.parallel([runUdp, runTcp], function(err, result) {
      cb(err, result);
    });
  }

  // get port start and port end
  var scanValue = _.map(scan.split('-'), function(value) {
    return value | 0;
  });

  var ports = _.range(_.min(scanValue), _.max(scanValue) + 1);

  // create the list of ports to be scanned
  var tasks = _.map(ports, function() {
    return _.bind(connect);
  });

  lasync.parallel(tasks, function(err, results) {
    if (err) {
      return done(err);
    }

    _.each(results, function(res) {
      _.each(res, function(val) {
        done(val.err, val.ok);
      });
    });
  });
};
