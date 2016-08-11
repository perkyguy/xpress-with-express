const net = require('net');
const express = require('express');
const app = express();
const path = require('path');

var client = {};
function defaultDataCallback(data){
    console.log('This is from Xpress:', data.toString());
}
client = net.createConnection({host: "192.168.1.3",port: 1337}, () => {
  //'connect' listener
  console.log('connected to Xpress!');
  client.write('\n');
});
client.on('data', defaultDataCallback);
client.on('end', () => {
  console.log('disconnected from Xpress');
});

app
    .get('/', function(req, res){
       res.sendFile(path.join(__dirname+'/express-xpress-node.html'));
    })
    .get('/relay/:relayCommand', function (req, res) {
        var reply = {msg: ""};
        if(req.params.relayCommand == "enable"){
            client.write('relay enable\r\n');
            reply.msg = "Shields online..."; 
        } else if(req.params.relayCommand == "disable"){
            client.write('relay disable\r\n');
            reply.msg = "Tractor beam disabled...";
        } else {
            reply.msg = "What?!?!";
        }

        res.send(reply);
    })
    .get('/adcc', function(req, res){
        var adcc_callback;
        adcc_callback = (data) => {
            matches = data.toString('utf-8').match('ADC=(\\d+)');
            if(matches){
                res.send({msg: "Don't move that dial...or do...or whatever...", value: +matches[1]})
            } else {
                res.send({msg: 'No dice!', value: undefined});
            }
            client.removeListener('data', adcc_callback);
        };
        client.write('pot value\r\n');
        client.addListener('data', adcc_callback);
    })
    .get('/killMe', function (req, res) {
        res.send({msg: "You have so much to live for!!"});
    })
    .get('/killMe/:really', function (req, res) {
        if(req.params.really == "now"){
            client.end();
            throw '(╯°□°)–︻╦╤─ – – – -(*_*)';
        }
    })
    .listen(1337, function(){
        console.log("Pulling into port");
    });