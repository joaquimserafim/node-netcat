#node-netcat
	Arbitrary TCP and UDP connections and listens to be used in Node.js


###Description
	**v0.0.1**
	Intention to implement all that "nc" allows and to be used in Node.js,
		. open TCP connections and sending messages (Client)
		. listen on arbitary TCP ports and response to the received messages (Server)
		. only deal with IPv4 and TCP
		. portscan
	
	
	nc listener (-k -l cmdline)      -> Necat.server
	nc host port                     -> Netcat.client
	nc -z host port_start[-port_end] -> Netcat.portscan


####Installation

	npm install (--save) node-netcat


##Netcat -> 

####Client
	
	client.init(port, [host], [options])
	
	(ex.) options = {timeout: 60000}
	
	
	client.send('data', [callback]);
	
	client.end([message])// can send a message and close the connection

	events: on('open', function ())
			on('data', function (data))
			on('error', function (err))
			on('close', function ())
			
			
####Server (-k -l)
			
	server.init(port)
	
	server.close() // must not exists connections
	
	send data to client:
	1 - server.clients[client].end([message]) // send message and close connection
	2 - server.clients[client].write([message], [callback])
	
	events: on('ready', function ())
			on('data', function (data))
			on('error', function (err))
			on('close', function ())
			
####PortScan (-z [port_start-port_end])
	
	scan.run(host, [port_start-port_end], cb)

##Examples

####Client

	var Netcat = require('node-netcat')();
	
	var client = Netcat.client();
	
	client.init(5000);
	
	client.on('open', function () {
	  console.log('connect');
	  client.send('this is a test');
	});
	
	client.on('data', function (data) {
	  console.log(data.toString('ascii'));
	  client.end([message]);
	});
	
	client.on('error', function (err) {
	  console.log(err);
	});
	
	client.on('close', function () {
	  console.log('close');
	});

####Server

	var Netcat = require('node-netcat')();
	
	var server = Netcat.server();
	
	server.init(5000);
	
	server.on('ready', function () { console.log('server ready'); });
	server.on('data', function (data) { console.log('server rx: ' + data); });
	server.on('error', function (err) { console.log(err); });
	server.on('close', function () { console.log('server closed'); });
	
	server.send('this is a test');
	
	// send messages to clients
	for (var client in server.clients) {
      server.clients[client].end('received ' + data);
    }


####PortScan

	var Netcat = require('node-netcat')();

	var scan = Netcat.portscan();
	
	scan.run('google.com', '80-81', function (err, res) {
		console.log(err, res);	
	});