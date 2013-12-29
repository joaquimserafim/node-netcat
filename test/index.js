var test = require('tape');

var Netcat = require('../')();


test('server & client', function (t) {
  t.plan(7);
 
  var server = Netcat.server();
  var client = Netcat.client();

  server.init(4000);

  server.once('ready', function () { 
    t.pass('server ready');

    client.init(4000);
  });

  server.on('data', function (data) { 
    t.equal(data.length > 0, true, 'receive data: ' + data);

    for (var client in server.clients) {
      server.clients[client].end('received ' + data);
      t.pass('server send a message and end the connection');
    }

    setTimeout(function () { server.close(); }, 1000);
  });

  server.once('error', function (err) { t.error(err !== null, err); });

  server.once('close', function () { t.pass('server closed'); });

  // client
  client.on('open', function () { 
    t.pass('client connected'); 
    client.send('hello world', function () { t.pass('client send message'); });
  });

  client.on('data', function (data) {
     t.equal(data.length > 0, true, 'receive data: ' + data);
  });
});


test('portscan', function (t) {
  t.plan(2);// testing one with success and another with error

  var scan = Netcat.portscan();

  scan.run('google.com', '80-81', function (err, res) {
    if (err) return t.ok(err, err);

    t.ok(res, res);
  });
});