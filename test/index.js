var test = require('tape');

var Netcat = require('../');


test('server & client', function (t) {
  t.plan(13);
 
  var server = Netcat.server(4000);
  var client = Netcat.client(4000, {readEncoding: 'utf8'});

  server.once('ready', function () { 
    t.pass('server, ready');

    client.start();
  });

  server.on('data', function (client, data) {
    t.equal(data.length > 0, true, 'server, receive data: "' + data + '" from client ' + client);

    // test Buffer
    t.equal(Buffer.isBuffer(data), true, 'server, is configure to rx as Buffer');

    var clients = server.getClients();
    t.ok(clients, 'server, exists ' + clients.length + ' client active');

    for (var client in clients) {
      server.send(clients[client], data, true, function () {
        t.pass('server, send "' + data + '" to client ' + clients[client]);
      });
    }

    setTimeout(function () { server.close(); }, 1000);
  });

  server.on('client_on', function (client) { 
    t.ok(client, 'server, client connect ' + client); 
  });

  server.on('client_off', function (client) { 
    t.ok(client, 'server, client disconnet ' + client); 
  });

  server.once('error', function (err) { t.error(err !== null, err); });

  server.once('close', function () { t.pass('server, closed'); });

  server.listen();


  // client
  client.once('open', function () { 
    t.pass('client, connected'); 
    setTimeout(function () {
      client.send('Hello World', function () { t.pass('client, send message'); });
    }, 1000);
  });

  client.on('data', function (data) {
    t.equal(data.length > -1, true, 'client, receive data: ' + data);
    // test encoding
    t.equal(typeof data, 'string', 'client, is configure to rx as String ascii/utf8');
  });

  client.once('close', function () {
    t.pass('client, closed');
  });
});


test('portscan', function (t) {
  t.plan(4);// testing one with success and another with error

  var scan = Netcat.portscan();

  scan.run('google.com', '80-81', function (err, res) {
    // will fail in port 81
    if (err) return t.ok(err, err);

    t.ok(res, res);    
  });
});


test('upd', function (t) {
  t.plan(5);

  var server = Netcat.udpServer(5000, '127.0.0.1');
  var client = Netcat.udpClient(5000, '127.0.0.1');

  server.on('data', function (msg, client, protocol) {
    t.ok(msg, 'server, "' + msg + '", ' + JSON.stringify(client) + ', ' + protocol);
    setTimeout(function () { server.close(); }, 1200);
  });

  server.on('ready', function () {
    t.pass('server, ready');

    setTimeout(function () {
      client.send('Hello World UDP!!!!');
      setTimeout(function () { client.close(); }, 1000);
    }, 1000);
  });
  
  server.once('error', function (err) { t.error(err !== null, err); });

  server.once('close', function () { t.pass('server, closed'); });

  server.bind();


  client.on('open', function () { t.pass('client, open'); });

  client.once('error', function (err) { t.error(err !== null, err); });

  client.once('close', function () { t.pass('client, closed'); });
});




