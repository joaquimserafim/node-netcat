#node-netcat
	Arbitrary TCP and UDP connections and listens to be used in Node.js


##description
	**v0.0.1**
	Intention to implement all that "nc" allows and to be used in Node.js,
	for now can only open TCP connections and sending messages (Client), listen on arbitary TCP ports and response to the received messages (Server), and only deal with IPv4.


##Netcat -> 
	
	client(port, [host])
	
	client.send('data');

	events: on('connected', function ())
			on('data', function (data))
			on('error', function (err))
			on('disconnected', function ())
			
	##############################################
			
	server(port)
	
	events: on('ready', function ())
			on('data', function (data))
			on('error', function (err))
			on('close', function ())

##usage

**Client:**

	var Netcat = require('../')();
	
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

**Server:**

	var Netcat = require('../')();
	
	var server = Netcat.server(5000);
	
	server.on('ready', function () { console.log('server ready'); });
	server.on('data', function (data) { console.log('server rx: ' + data); });
	server.on('error', function (err) { console.log(err); });
	server.on('close', function () { console.log('server closed'); });