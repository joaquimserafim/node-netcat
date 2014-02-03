2013.12.30, Version 1.0.0

* TCP client, receive and send messages (Netcat.client)
* TCP server, listen on arbitary TCP ports and response to the received messages (Netcat.server)
* PortScan (Netcat.portscan)
* only deal with IPv4 and TCP


2013.12.30, Version 1.0.1

* Server - event "data" add new param "client" to identify who the sender


2013.12.30, Version 1.0.2

* Server - implement encoding
* Client - implement encoding


2013.12.31, Version 1.0.3

* Server - method 'send', when a client close connection and the server is write to socket at the moment throws a exception.


2013.12.31, Version 1.0.4

* Server - add new event "client_off" fires when a client disconnet, change event "client" to "client_on"


2014.01.01, Version 1.0.5

* Server - the object initialization '(port, encoding)' now use the parameter options (encoding, socket timeout) '(port, options={encoding, timeout})'
* Client - move the configuration params from method to the constructor class, change the method name 'init' to 'start'

2014.01.02, Version 1.1.5

* Server/Client - to suport receive the original Buffer objects, now 'options' parameter have the new properties 'read_encoding' (default to buffer) and 'write_encoding' (default to ascii)
* Client - method 'end' was removed, 'send' suports close the connection "send(message_to_send, [close_connection], [callback])", close_connection default to false
* PortScan - change to suport the new features from Client 


2014.01.23, Version 1.3.5

* Implemented UDP Protocol / Update Client - Server - PortScan
* License ISC


2014.01.29, Version 1.3.5

* Add parameter "host" in Server lib


2014.01.31, Version 1.4.5

* Client/Server - removed option 'write_encoding' now all writes are passed as Buffer.


2014.02.03, Version 1.4.6

* Client/Server - Fix bug in 'send' method when sending of a value as 'null'

