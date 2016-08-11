var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket).pipe(process.stdout);
});

server.listen(1337, '192.168.43.79');