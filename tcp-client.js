const net = require('net');
const http = require("http");
const url = require('url');
const querystring = require('querystring');

var client = {};
client = net.createConnection({host: "192.168.1.3",port: 1337}, () => {
  //'connect' listener
  console.log('connected to server!');
  client.write('\n');
});
client.on('data', (data) => {
  console.log('This is from Xpress', data.toString());
});
client.on('end', () => {
  console.log('disconnected from server');
});

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (req, resp) {
    resp.writeHead(200, {'Content-Type': 'text/plain'});
    
    var query_params = querystring.parse(req.url.replace(/^.*\?/, '')) || {};
    if(query_params.relay){
        if(query_params.relay == "enable"){
            client.write('relay enable\r\n');
            resp.write("Shields back online!");
            // console.log('This is where I would enable it...');
        } else if(query_params.relay == "disable"){
            client.write('relay disable\r\n');
            resp.write("Tractor Beam disabled...");
            // console.log('This is where I would DISABLE it...');
        } else {
            console.log("I have no idea what you're asking me to do");
            resp.write("What?!?!");
        }
    }
    
    resp.end('I regret that I have but one life to give for your web requests...'); 
    if(query_params.killMe && query_params.killMe == "now"){
        client.end();
        throw '(╯°□°)–︻╦╤─ – – – -(*_*)';
    }
}).listen(1337, '127.0.0.1');