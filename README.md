#node-netcat


<a href="https://nodei.co/npm/node-netcat/"><img src="https://nodei.co/npm/node-netcat.png"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/node-netcat.png?branch=master)](https://travis-ci.org/joaquimserafim/node-netcat)

###Description

  Arbitrary TCP and UDP connections and listens to be used in Node.js
	
	Trying to implement all that "nc" allows to be used in Node.js, this is a good 
	module to implement simple server/client testing stuff or even to create simple
	tcp servers and clients.
		
	v1.1.5
		. open TCP connections and sending messages (client)
		. listen on arbitary TCP ports and response to the received messages (server)
		. PortScan (portscan)
		. only deal with IPv4 and TCP
	
	
	nc listener (-k -l cmdline)      -> Necat.server
	nc host port                     -> Netcat.client
	nc -z host port_start[-port_end] -> Netcat.portscan


####Installation

	npm install (--save) node-netcat


##Netcat -> 

####Client

	var client = new Netcat.client(port, host, [options])
	
	options = {
	 // define a connection timeout
		timeout: 60000,
	 // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
	  read_encoding: 'buffer',
	 // ascii(default), base64, utf8, hex
	 write_encoding: 'ascii'
	 }

	// client init connection
	 client.start()
	
	
	send data:
	
	client.send('message', [close_connection], [callback]);
	
	close_connection: false is the default value


	events:
	
		on('open', function ())
		on('data', function (data))
		on('error', function (err))
		on('close', function ())
			
			
####Server (-k -l)

	var server = new Netcat.server(port, [options]);
	
	options = {
	 // define a connection timeout
		timeout: 60000,
	 // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
	  read_encoding: 'buffer',
	 // ascii(default), base64, utf8, hex
	 write_encoding: 'ascii'
	 }
			
	server.listen()// init server
	
	server.close()// close server but must not exists active clients
	
	
	send data to a client:
		
	server.send(client, message, [close_connection], [callback]);
	
	close_connection: false is the default value, this is a way to close the connection with a client.
	callback: parameter will be executed when the data is finally written out - this may not be immediately.
	
	
	get clients:
	
	server.getClients();// return an array
	
	
	events: 
	
		on('ready', function ())// server it's ready
		on('data', function (client, data))
		on('client_on', function (client))// client connect
		on('client_off', function (client))// client disconnect
		on('error', function (err))
		on('close', function ())// closes the server
			
####PortScan (-z [port_start-port_end])
	
	scan.run(host, ports*, cb)
	
	* a single port 80 or between various ports 22-80

##Examples

####Client

	var Netcat = require('node-netcat');
	
	var client = Netcat.client(5000, 'localhost');
	
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

####Server

	var Netcat = require('node-netcat');
	
	var server = Netcat.server(5000);
	
	
	server.on('ready', function () { console.log('server ready'); });
	server.on('data', function (client, data) { console.log('server rx: ' + data + ' from ' + client); });
	server.on('client_on', function (client) { console.log('client on ', client); });
	server.on('client_of', function (client) { console.log('client off ', client); });
	server.on('error', function (err) { console.log(err); });
	server.on('close', function () { console.log('server closed'); });

	server.listen();// start to listening
		
	// get active clients
	var clients = server.getClients();
	
	// send messages to clients	 and close the connection
	for (var client in clients) {
      server.send(clients[client], 'received ' + data, true);
    }

	// or a normal message	
	server.send(client, 'message');
	


####PortScan

	var Netcat = require('node-netcat');

	var scan = Netcat.portscan();
	
	scan.run('google.com', '80-81', function (err, res) {
		console.log(err, res);	
	});
	
	
	


	

### The MIT License (MIT)

**Copyright (c) 2013 [Joaquim Serafim](http://joaquimserafim.pt)**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

