/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var client = require('engine.io-client');
var protocol = require('@sazze/rc-protocol');

var Message = protocol.Message;
var Response = protocol.Response;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var name = process.env.SZ_RC_CERT_NAME;

protocol.Auth.createSig(name, process.env.SZ_RC_CERT_DIR, function (err, authHeader) {
  if (err) {
    console.log(err.stack || err.message || err);
    process.exit(1);
  }

  var options = {
    rejectUnauthorized: false,
    rememberUpgrade: true,
    transports: ['websocket'],
    extraHeaders: {
      authorization: authHeader
    }
  };

  console.log(options);

  var socket = client('wss://127.0.0.1:4515', options);

  socket.on('open', function () {
    console.log('socket open');

    var message = new Message();

    message.command = 'echo "Hello World!"; printenv';
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
});