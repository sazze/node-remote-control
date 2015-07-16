/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var _ = require('lodash');

if (_.isUndefined(process.env.DEBUG)) {
  process.env.DEBUG = 'error,warn,info';
}

var Server = require('./lib/server');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var debug = require('debug')('main');

var options = {};

if (!_.isUndefined(argv.help) && argv.help) {
  console.log('    pass the --configFile option to load options from a JSON formatted file (full path to file is recommended)');
  process.exit(0);
}

if (!_.isUndefined(argv.version) && argv.version) {
  console.log('    version: ' + require('./package.json').version);
  console.log('    nodejs: ' + process.version);
  process.exit(0);
}

if (!_.isUndefined(argv.configFile) && fs.existsSync(argv.configFile)) {
  debug('loading config from ' + argv.configFile);

  options = require(argv.configFile);

  if (!_.isPlainObject(options)) {
    options = {};
  }
}

debug(options);

var server = new Server(options);

process.on('SIGINT', function () {
  server.stop(function () {
    debug('server stopped');
  });
});

process.on('SIGTERM', function () {
  server.stop(function () {
    debug('server stopped');
  });
});

server.start();