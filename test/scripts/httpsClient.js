/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var https = require('https');
var fs = require('fs');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var options = {
  rejectUnauthorized: false,
  hostname: '127.0.0.1',
  port: 8080,
  key: fs.readFileSync(__dirname + '/../../../../../../vpn/c1.cs1.sazze.com/cthayer.key'),
  cert: fs.readFileSync(__dirname + '/../../../../../../vpn/c1.cs1.sazze.com/cthayer.crt'),
  path: '/engine.io/?EIO=3&transport=websocket'
};

var client = https.request(options, function (res) {
  console.log(res.statusCode);
  console.log(res.headers);

  res.on('data', function (data) {
    console.log(data);
  });

  res.on('error', function (err) {
    console.log(err);
  });
});

client.end();

client.on('error', function (err) {
  console.log(err);
});