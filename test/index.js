var test = require('tape');

var Netcat = require('../')();


test('server & client', function (t) {
  t.plan(10);
 
  var server = Netcat.server();
  var client = Netcat.client();

  server.init(4000);

  server.once('ready', function () { 
    t.pass('server, ready');

    client.init(4000);
  });

  server.on('data', function (data) { 
    t.equal(data.length > 0, true, 'server, receive data: ' + data);

    var clients = server.getClients();
    t.ok(clients, 'server, exists ' + clients.length + ' client active');

    for (var client in clients) {
      server.send(clients[client], 'received ' + data, true, function () {
        t.pass('server send ' + data.toString() + ' to client ' + clients[client]);
      });
    }

    setTimeout(function () { server.close(); }, 1000);
  });

  server.on('client', function (client) { t.ok(client, 'server, new client ' + client); });

  server.once('error', function (err) { t.error(err !== null, err); });

  server.once('close', function () { t.pass('server, closed'); });


  // client
  client.on('open', function () { 
    t.pass('client, connected'); 
    client.send('hello world', function () { t.pass('client send message'); });
  });

  client.on('data', function (data) {
     t.equal(data.length > 0, true, 'client, receive data: ' + data);
  });

  client.on('close', function () {
    t.pass('client, closed');
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