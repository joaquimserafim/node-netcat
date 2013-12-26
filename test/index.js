var tape = require('tape');

var Netcat = require('../')();

var server = Netcat.server(5000);

server.on('ready', function () { console.log('server ready'); });
server.on('data', function (data) { console.log('server rx:' + data); });
server.on('error', function (err) { console.log(err); });
server.on('close', function () { console.log('server closed'); });


var client = Netcat.client(5000);


client.on('connected', function () {
  console.log('connected');

  client.send('this is a test\n');
});

client.on('data', function (data) {
  console.log(data.toString('ascii'));

  client.close();
});

client.on('error', function (err) {
  console.log(err);
});

client.on('disconnected', function () {
  console.log('disconnected');
});
