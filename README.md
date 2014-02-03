#node-netcat


<a href="https://nodei.co/npm/node-netcat/"><img src="https://nodei.co/npm/node-netcat.png?downloads=true"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/node-netcat.png?branch=master)](https://travis-ci.org/joaquimserafim/node-netcat)

<img src="https://david-dm.org/joaquimserafim/lasync.png">

###Description

  Arbitrary TCP and UDP connections and listens to be used in Node.js
	
	Trying to implement all that "nc" allows to be used in Node.js, this is a good 
	module to implement simple server/client testing stuff or even to create simple
	tcp servers and clients.
		
	v1.4
		. open TCP/UDP connections and sending messages (client)
		. listen on arbitary TCP/UDP ports and response to the received messages (server)
		. PortScan (portscan)
		. TCP only deal with IPV4
	
	
	nc listener (-k -l cmdline)      -> Necat.server
	nc host port                     -> Netcat.client
	nc -z host port_start[-port_end] -> Netcat.portscan


####Installation

	npm install (--save) node-netcat


##Netcat -> API

####Client

	new Netcat.client(port, host, [options])
	
	options = {
	 // define a connection timeout
		timeout: 60000,
	 // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
	  read_encoding: 'buffer'
	 }

	// client init connection
	 client.start()
	
	
	send data:
	
	client.send('message - don't need pass as Buffer, [close_connection], [callback]);
	
	close_connection: false is the default value


	events:
	
		on('open', function ())
		on('data', function (data))
		on('error', function (err))
		on('close', function ())
			
			
####Server (-k -l)

	new Netcat.server(port, [host], [options])
	
	options = {
	 // define a connection timeout
		timeout: 60000,
	 // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
	  read_encoding: 'buffer'
	 }
			
	server.listen()// init server
	
	server.close()// close server but must not exists active clients
	
	
	send data to a client:
		server.send(client, ' don't need to pass as Buffer, [close_connection], [callback]);
	
		close_connection: false is the default value, this is a way to close 
			the connection with a client.
		callback: parameter will be executed when the data is finally written 
			out - this may not be immediately.
	
	
	get clients:
	
	server.getClients();// return an array
	
	
	events: 
	
		on('ready', function ())// server it's ready
		on('data', function (client, data))
		on('client_on', function (client))// client connect
		on('client_off', function (client))// client disconnect
		on('error', function (err))
		on('close', function ())// closes the server
		

####UDP Client (-u)

    Netcat.udpClient(port, host, [options])
    
    options = {
	 // define a connection timeout
		timeout: 60000,
	 // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
	  read_encoding: 'buffer''
	 }
    
    events:
		on('open', function ())
		on('message', function (message, {port, address}, protocol_family))
		on('error', function (err))
		on('close', function ())
        
        // protocol_family - ipv4 | ipv6

    
    methods:
        close()
        start() // init client
        send('message')
     
    "message" not pass a Buffer!!!
 
#####  *A Note about UDP datagram size

> The maximum size of an IPv4/v6 datagram depends on the MTU (Maximum Transmission Unit) and on the Payload Length field size.
> 
> The Payload Length field is 16 bits wide, which means that a normal payload cannot be larger than 64K octets including internet header and data (65,507 bytes = 65,535 − 8 bytes UDP header − 20 bytes IP header); this is generally true for loopback interfaces, but such long datagrams are impractical for most hosts and networks.
> 
> The MTU is the largest size a given link layer technology can support for datagrams. For any link, IPv4 mandates a minimum MTU of 68 octets, while the recommended MTU for IPv4 is 576 (typically recommended as the MTU for dial-up type applications), whether they arrive whole or in fragments.
> 
> For IPv6, the minimum MTU is 1280 octets, however, the mandatory minimum fragment reassembly buffer size is 1500 octets. The value of 68 octets is very small, since most current link layer technologies have a minimum MTU of 1500 (like Ethernet).
> 
> Note that it's impossible to know in advance the MTU of each link through which a packet might travel, and that generally sending a datagram greater than the (receiver) MTU won't work (the packet gets silently dropped, without informing the source that the data did not reach its intended recipient). 


####UDP Server (-u -k -l)

    Netcat.udpServer(port, host, [options])
    
    options = {
	 // define a connection timeout
		timeout: 60000,
	 // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
	  read_encoding: 'buffer''
	 }

    methods:
        close()
        bind() // binding to a port


    events:
		on('ready', function ())
		on('data', function (client, data, protocol family))
		on('error', function (err))
		on('close', function ())
		
					
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
	

####UDP Client

    var client = Netcat.udpClient(5000, '127.0.0.1');
    
    client.on('open', function () {  console.log('open'); });
    
    client.once('error', function (err) {  console.error('err'); });
    
    client.once('close', function () { console.log('client, closed'); });
    
    clien.send('Hello World');

	
####UDP Server

    var server = Netcat.udpServer(5000, '127.0.0.1');
    
    server.on('data', function (msg, client, protocol) {
      console.log('rx: ' + msg + ', from ' + client);
    });

    server.on('ready', function () { console.log('ready'); });
      
    server.once('error', function (err) { console.log(err); });
    
    server.once('close', function () { console.log('close'); });
    
    server.bind();
    
    
    setTimeout(function () {
      server.close();
    }, 30000);



####PortScan

	var Netcat = require('node-netcat');

	var scan = Netcat.portscan();
	
	scan.run('google.com', '80-81', function (err, res) {
		console.log(err, res);	
	});
