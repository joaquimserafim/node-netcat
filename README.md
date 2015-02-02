# node-netcat


<a href="https://nodei.co/npm/node-netcat/"><img src="https://nodei.co/npm/node-netcat.png?downloads=true"></a>

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](https://travis-ci.org/joaquimserafim/node-netcat)![Code Coverage 100%](https://img.shields.io/badge/code%20coverage-100%25-green.svg?style=flat-square)[![ISC License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](https://github.com/joaquimserafim/node-netcat/blob/master/LICENSE)

## Description

  Arbitrary TCP and UDP connections and listens to be used in Node.js
	

>This module try to implement all that "nc" allows to be used in Node.js, this is a good module to implement simple server/client testing stuff or even to create simple tcp servers and clients.


		
#### Current features:
*	open TCP/UDP connections and sending messages (client)
*	listen on arbitary TCP/UDP ports and response to the received messages (server)
*	PortScan (portscan)
*	TCP only deal with IPV4

`var Netcat = require('node-netcat')`

| nc | node-netcat|
|----|------------|
| nc listener (-k -l cmdline)   |    Necat.server        |
| nc host port  |       Netcat.client     |
|  nc -z host port_start[-port_end]  |     Netcat.portscan       |



### Installation

	npm i --save node-netcat


## Netcat -> API

### Client

`Netcat.client(port, host, [options])`

*	**port** {int} required
*	**host** {string} required
*	**options**
	*	**timeout** {int} define a connection timeout in miliseconds, default to 60000,
	*	**read_encoding** {string} the read encoding, default to 'buffer', others values ascii, hex,utf8, base64

#### start()
client starts the connection

#### close()
close the connection

#### send(message, [close_connection], [callback])
send messages and can close the connection after send the message

*	**message** {string} don't need to be a Buffer
*	**close_connection** {boolean} default to false
*	**callback** - {function} ?

#### events
*	**open** callback()
*	**data** callback(data)
*	**error** callback(err)
*	**close** callback()
			
			
### Server (-k -l)

`new Netcat.server(port, [host], [options])`

*	**port** {int} required
*	**host** {string} required
*	**options**
	*	**timeout** {int} define a connection timeout in miliseconds, default to 60000,
	*	**read_encoding** {string} the read encoding, default to 'buffer', others values ascii, hex,utf8, base64

			
#### listen()
initialize the server

#### close()
close the server but must not exists active clients
	
#### send(client, message, [close_connection], [callback])
send messages to a particular client and can close the connection after send the message

*	**message** {string} don't need to be a Buffer
*	**close_connection** {boolean} default to false
*	**callback** - {function} ?	parameter will be executed when the data is finally written out, this may not be immediately
	
#### getClients()
return an array with all active clients

#### events
*	**ready** callback() - server it's ready
*	**data** callback(data)
*	**client_on** callback(client)
*	**client_off** callback(client)
*	**error** callback(err)
*	**close** callback()
		

### UDP Client (-u)

`Netcat.udpClient(port, host, [options])`

*	**port** {int} required
*	**host** {string} required
*	**options**
	*	**timeout** {int} define a connection timeout in miliseconds, default to 60000,
	*	**read_encoding** {string} the read encoding, default to 'buffer', others values ascii, hex,utf8, base64
    
#### events
*	**open** callback()
*	**message** callback(message, {port, address}, protocol_family*[ipv4 | ipv6]*)
*	**error** callback(err)
*	**close** callback()
    
#### start()
init the client

#### close()
close the client

#### send(message)
send a message and the message should not be a Buffer
 
### A Note about UDP datagram size

> The maximum size of an IPv4/v6 datagram depends on the MTU (Maximum Transmission Unit) and on the Payload Length field size.
> 
> The Payload Length field is 16 bits wide, which means that a normal payload cannot be larger than 64K octets including internet header and data (65,507 bytes = 65,535 − 8 bytes UDP header − 20 bytes IP header); this is generally true for loopback interfaces, but such long datagrams are impractical for most hosts and networks.
> 
> The MTU is the largest size a given link layer technology can support for datagrams. For any link, IPv4 mandates a minimum MTU of 68 octets, while the recommended MTU for IPv4 is 576 (typically recommended as the MTU for dial-up type applications), whether they arrive whole or in fragments.
> 
> For IPv6, the minimum MTU is 1280 octets, however, the mandatory minimum fragment reassembly buffer size is 1500 octets. The value of 68 octets is very small, since most current link layer technologies have a minimum MTU of 1500 (like Ethernet).
> 
> Note that it's impossible to know in advance the MTU of each link through which a packet might travel, and that generally sending a datagram greater than the (receiver) MTU won't work (the packet gets silently dropped, without informing the source that the data did not reach its intended recipient). 


### UDP Server (-u -k -l)

`Netcat.udpServer(port, host, [options])`

*	**port** {int} required
*	**host** {string} required
*	**options**
	*	**timeout** {int} define a connection timeout in miliseconds, default to 60000,
	*	**read_encoding** {string} the read encoding, default to 'buffer', others values ascii, hex,utf8, base64

#### bind()
binding to a port

#### close()

#### events
*	**ready** callback() - server it's ready
*	**data** callback(data)
*	**error** callback(err)
*	**close** callback()
		
					
### PortScan (-z [port_start-port_end])

#### scan.run(host, ports*, callback)
*	**host** {string}
*	**ports** {int | expression} a single port 80 or between various ports for example: 22-80
*	**callback** {function}


## Examples

### Client

```javascript
var NetcatClient = require('node-netcat').client;
var client = NetcatClient(5000, 'localhost');
	
client.on('open', function () {
	console.log('connect');
	client.send('this is a test' + '\n');
});

client.on('data', function (data) {
  console.log(data.toString('ascii'));
  client.send('Goodbye!!!', true);
});

client.on('error', function (err) {
  console.log(err);
});

client.on('close', function () {
  console.log('close');
});

client.start();
```

### Server

```javascript
var NetcatServer = require('node-netcat').server;
var server = NetcatServer(5000);

server.on('ready', function() {
	console.log('server ready');
});

server.on('data', function(client, data) {
	console.log('server rx: ' + data + ' from ' + client);
});

server.on('client_on', function(client) {
	console.log('client on ', client);
});

server.on('client_of', function(client) {
	console.log('client off ', client);
});

server.on('error', function(err) {
	console.log(err);
});

server.on('close', function() {
	console.log('server closed');
});

server.listen();// start to listening
	
// get active clients
var clients = server.getClients();

// send messages to clients	 and close the connection
Object.keys(clients).forEach(function(client) {
	server.send(clients[client], 'received ' + data, true);
});

// or a normal message	
server.send(client, 'message');
```

### UDP Client

```javascript
var NetcatUdpClient = require('node-netcat').udpClient;
var client = NetcatUdpClient(5000, '127.0.0.1');

client.on('open', function() { 
	console.log('open');
});

client.once('error', function(err) {
	console.error('err');
});

client.once('close', function() {
	console.log('client, closed');
});

clien.send('Hello World');
```
	
### UDP Server

```javascript
var NetcatUdpServer = require('node-netcat').udpServer;
var server = NetcatUdpServer(5000, '127.0.0.1');

server.on('data', function(msg, client, protocol) {
  console.log('rx: ' + msg + ', from ' + client);
});

server.on('ready', function() {
	console.log('ready');
});

server.once('error', function(err) {
	console.log(err);
});

server.once('close', function() {
	console.log('close');
});

server.bind();

setTimeout(function () {
  server.close();
}, 30000);
```


### PortScan

```javascript
var scan = require('node-netcat').portscan();

scan.run('google.com', '80-81', function(err, res) {
	if (err) {
		// ERR
	} else {
		// RES
	}
});
```


## Development

##### this projet has been set up with a precommit that forces you to follow a code style, no jshint issues and 100% of code coverage before commit

to run test
``` js
npm test
```

to run jshint
``` js
npm run jshint
```

to run code style
``` js
npm run code-style
```

to run check code coverage
``` js
npm run check-coverage
```

to open the code coverage report
``` js
npm run open-coverage
```
