const net = require('net');
const express = require('express');
const app = express();
const path = require('path');

var clients = [];

const XPRESS_DATA_STRING = "It's not about money, it's about sending a message.\r\n";

function noClients() {
    return clients.length == 0;
}

function sendToClients(message, options) {
    options = options || {};
    clients.forEach(function(socket) {
        if (options.callback != null) {
            if (!options.addToXpressOnly || (options.addToXpressOnly && socket.is_xpress)) {
                socket.removeAllListeners('data')
                socket.on('data', function(d) {
                    options.callback(d, socket);
                });
            }
        } else {
            socket.removeAllListeners('data')

            socket.on('data', (data) => {
                defaultDataCallback(data, socket);
            })
        }
        socket.write(message);
    });

    clients.forEach(function(socket) {
        if (socket.destroyed) {
            // console.log(socket);
            clients.splice(clients.indexOf(socket), 1);
        }
    });
    // Log it to the server output too
    process.stdout.write(message)
}

function defaultDataCallback(data, socket) {
    if (data.toString() == XPRESS_DATA_STRING) {
        socket.is_xpress = true;
        socket.name = "Xpress-" + socket.remoteAddress.match(/\d+$/)[0];
    }
    console.log("<" + socket.name + ">", data.toString());
}


var server = net.createServer((socket) => {
    socket.name = socket.remoteAddress + ":" + socket.remotePort
    console.log('[' + socket.name + ']');
    clients.push(socket);
    socket
        .on('data', (data) => {
            defaultDataCallback(data, socket);
        })
        .on('end', () => {
            console.log('{' + socket.name + "}");
        })
        .on('error', (e) => {
            console.log('Caught some error, disconnected?', e);
            socket.destroy();
            socket.end();
        })
}).listen(1337);

app
    .get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/express-xpress-node.html'));
    })
    .get('/relay/:relayCommand', function(req, res) {
        if (noClients()) {
            res.send({ msg: 'No Clients...' });
            return;
        }

        var reply = { msg: "" };
        if (req.params.relayCommand == "enable") {

            sendToClients('relay enable\r\n');
            reply.msg = "Shields online...";
        } else if (req.params.relayCommand == "disable") {
            sendToClients('relay disable\r\n');
            reply.msg = "Tractor beam disabled...";
        } else {
            reply.msg = "What?!?!";
        }

        res.send(reply);
    })
    .get('/adcc', function(req, res) {
        var adcc_callback;
        adcc_callback = (data, client) => {
            if (res.headersSent) {
                console.log('Headers sent...');
                client.removeListener('data', adcc_callback);
                return;
            }
            matches = data.toString('utf-8').match('ADC=(\\d+)');
            if (matches) {
                res.send({ msg: "Don't move that dial...or do...or whatever...", value: +matches[1] })
            } else {
                res.send({ msg: 'No dice!', value: undefined });
            }

        };
        sendToClients('pot value\r\n', {
            callback: adcc_callback,
            addToXpressOnly: true
        });
    })
    .listen(8008, function() {
        console.log("Pulling into port");
    });