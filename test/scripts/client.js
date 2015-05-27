/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var client = require('engine.io-client');
var https = require('https');
var os = require('os');
var protocol = require('sz-rc-protocol');
var fs = require('fs');

var Message = protocol.Message;
var Response = protocol.Response;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var options = {
  rejectUnauthorized: false,
  rememberUpgrade: true,
  key: fs.readFileSync(__dirname + '/../../../../../../vpn/c1.cs1.sazze.com/cthayer.key'),
  cert: fs.readFileSync(__dirname + '/../../../../../../vpn/c1.cs1.sazze.com/cthayer.crt'),
  transports: ['websocket']
};


console.log(options);

var socket = client('wss://127.0.0.1:8080', options);

socket.on('open', function () {
  console.log('socket open');

  var message = new Message();

  message.command = 'echo "Hello World!"';
  //message.args = ['"Hello World!"'];

  socket.send(JSON.stringify(message));
});

socket.on('message', function (data) {
  console.log(data);
});

socket.on('error', function (err) {
  console.log(err);
});

socket.on('close', function () {
  console.log('socket close');
});

socket.on('pong', function () {
  console.log('pong');
});

socket.on('ping', function () {
  console.log('ping');
});