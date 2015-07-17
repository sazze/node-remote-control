/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var engine = require('engine.io');
var https = require('https');
var pem = require('pem');
var debug = require('debug')('server');
var _ = require('lodash');
var protocol = require('sz-rc-protocol');
var fs = require('fs');
var Command = require('./command');
var defConfig = require('../defConfig');
var request = require('request');
var tls = require('tls');
var info = require('debug')('info');
var warn = require('debug')('warn');
var error = require('debug')('error');

var Message = protocol.Message;
var Response = protocol.Response;

var PUBLIC_DIR = __dirname + '/../public';

var COMMAND_QUEUE_MAX_BACKLOG = 20;
var MAX_RUNNING_COMMANDS = 5;

function Server(options) {
  this.server = null;
  this.httpsServer = null;
  this.caCerts = null;
  this.serverCerts = null;
  this.commandQueue = [];
  this.runningCommands = 0;

  this.options = {
    httpsOptions: {}
  };

  if (!_.isPlainObject(options)) {
    options = {};
  }

  _.merge(this.options, defConfig, options);

  if (this.options.pidFile) {
    fs.writeFileSync(this.options.pidFile, process.pid.toString(), 'ascii');
  }
}

module.exports = Server;

Server.prototype.start = function (callback) {
  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  this.createCerts(function (err) {
    if (err) {
      callback(err);
      return;
    }

    debug('starting server');

    debug(this.options.httpsOptions);

    this.httpsServer = https.createServer(this.options.httpsOptions, function (req, res) {
      debug(req.url);

      var file = null;

      switch (req.url) {
        case '/':
        case '/index.html':
          res.setHeader('Content-Type', 'text/html');
          file = PUBLIC_DIR + '/index.html';
          break;

        case '/js/jquery-2.1.4.min.js':
          res.setHeader('Content-Type', 'text/javascript');
          file = PUBLIC_DIR + req.url;
          break;

        case '/js/jquery.mousewheel-3.1.12.min.js':
          res.setHeader('Content-Type', 'text/javascript');
          file = PUBLIC_DIR + req.url;
          break;

        case '/js/jquery.terminal-0.8.8.min.js':
          res.setHeader('Content-Type', 'text/javascript');
          file = PUBLIC_DIR + req.url;
          break;

        case '/js/engine.io-1.5.1.js':
          res.setHeader('Content-Type', 'text/javascript');
          file = PUBLIC_DIR + req.url;
          break;

        case '/css/jquery.terminal.css':
          res.setHeader('Content-Type', 'text/css');
          file = PUBLIC_DIR + req.url;
          break;

        case '/css/terminal.css':
          res.setHeader('Content-Type', 'text/css');
          file = PUBLIC_DIR + req.url;
          break;

        default:
          break;
      }

      if (file && fs.existsSync(file)) {
        fs.createReadStream(file).pipe(res);
      } else {
        res.writeHead(404);
        res.end('404 Not Found');
      }
    });

    this.httpsServer.on('connection', this.manageHttpsConnections.bind(this));

    this.options.engineOptions.transports = ['websocket'];
    this.options.engineOptions.allowRequest = this.allowWebsocketConnection.bind(this);

    debug(this.options.engineOptions);

    this.server = engine.Server(this.options.engineOptions);
    this.server.attach(this.httpsServer);

    this.server.on('connection', function (socket) {
      var connectionInfo = {
        remoteAddress: socket.request.connection.remoteAddress,
        remotePort: socket.request.connection.remotePort,
        wsId: socket.id
      };

      info('client connected: ' + JSON.stringify(connectionInfo));

      socket.on('message', function (data) {
        debug(data);

        if (_.isString(data)) {
          try {
            data = JSON.parse(data);
          } catch (e) {
            error(e);
            socket.close();
            info(_.merge({}, connectionInfo, {command: data, response: null}));
            return;
          }
        }

        var message = new Message(data);

        this.handleMessage(message, function (err, resp) {
          if (err) {
            error(err);
          }

          if (!(resp instanceof Response)) {
            error('Invalid response: ' + JSON.stringify(resp));
            socket.close();
            info(_.merge({}, connectionInfo, {command: message, response: null}));
            return;
          }

          if (message.id && resp.id != message.id) {
            warn('Response is for another message (' + message.id + ' != ' + resp.id + ')');
            socket.close();
            info(_.merge({}, connectionInfo, {command: message, response: null}));
            return;
          }

          info(_.merge({}, connectionInfo, {command: message, response: resp}));

          socket.send(JSON.stringify(resp));
        });
      }.bind(this));

      socket.on('error', function (err) {
        info(err);
      });

      socket.on('close', function () {
        info('client disconnected: ' + JSON.stringify(connectionInfo));
      });
    }.bind(this));

    this.httpsServer.listen(this.options.port, this.options.host, function () {
      info(JSON.stringify(this.httpsServer.address()) + ' (pid: ' + process.pid.toString() + ')');
    }.bind(this));

    this.httpsServer.on('error', function (err) {
      debug(err);
    });
  }.bind(this));
};

Server.prototype.stop = function (callback) {
  debug('closing servers');

  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  this.httpsServer.close();

  this.server.close();

  process.nextTick(callback);
};

Server.prototype.handleMessage = function (msg, callback) {
  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  if (!(msg instanceof Message)) {
    callback(new Error('msg must be an instance of Message'));
    return;
  }

  if (this.commandQueue.length >= COMMAND_QUEUE_MAX_BACKLOG) {
    callback(new Error('command queue is full. ' + this.commandQueue.length + ' commands waiting to run'));
    return;
  }

  var command = new Command();

  this.commandQueue.push({command: command, message: msg, callback: callback});

  process.nextTick(this.runCommands.bind(this));
};

Server.prototype.runCommands = function() {
  if (this.commandQueue.length < 1) {
    return;
  }

  if (this.runningCommands >= MAX_RUNNING_COMMANDS) {
    return;
  }

  this.runningCommands++;

  var cmd = this.commandQueue.shift();

  cmd.command.run(cmd.message, function (err, resp) {
    this.runningCommands--;

    process.nextTick(function () {
      cmd.callback(err, resp);
    });

    this.runCommands();
  }.bind(this));

  this.runCommands();
};

Server.prototype.createCerts = function (callback) {
  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  debug('generating ca certs');

  pem.createCertificate({selfSigned: true, days: 365}, function (err, ca) {
    if (err) {
      debug(err);
      callback(err);
      return;
    }

    this.caCerts = ca;

    debug('generating server certs');

    var certOptions = {
      selfSigned: false,
      days: 365,
      serviceKey: ca.clientKey,
      serviceCertificate: ca.certificate,
      serial: 1
    };

    pem.createCertificate(certOptions, function (err, out) {
      if (err) {
        debug(err);
        callback(err);
        return;
      }

      this.serverCerts = out;

      this.options.httpsOptions.rejectUnauthorized = false;
      this.options.httpsOptions.requestCert = false;

      this.options.httpsOptions.SNICallback = this.getSecureContext.bind(this);

      callback();
    }.bind(this));
  }.bind(this));
};

Server.prototype.getSecureContext = function (serverName, callback) {
  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  debug('creating secure context for ' + serverName);

  var options = {
    key: this.serverCerts.clientKey,
    cert: this.serverCerts.certificate,
    honorCipherOrder: true,
    ciphers: this.options.ciphers
  };

  var context = tls.createSecureContext(options);

  callback(null, context);
};

Server.prototype.manageHttpsConnections = function (socket) {
  // we don't care about orphaning https sockets, only websockets handled by engine.io matter
  socket.unref();
};

Server.prototype.allowWebsocketConnection = function (req, next) {
  debug(req.headers);

  // Looking for the following header to authorize the upgrade request
  // Authorization: RC Name;ISO-8601-TimeStamp;Signature

  if (_.isUndefined(req.headers) || _.isUndefined(req.headers[protocol.Auth.headerName])) {
    // Authorization header is missing
    error('upgrade request missing authorization header.  closing connection');
    next(1, false);
    return;
  }

  protocol.Auth.checkSig(req.headers[protocol.Auth.headerName], this.options.certDir, function (err, valid) {
    if (err) {
      error(err.stack || err.message || err);
      next(2, false);
      return;
    }

    if (!valid) {
      // Invalid signature
      error('Invalid signature');
      next(3, false);
      return;
    }

    // we're good
    next(null, true);
  });
};