/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var protocol = require('@sazze/rc-protocol');
var Message = protocol.Message;
var Response = protocol.Response;
var _ = require('lodash');
var exec = require('child_process').exec;

function Command() {
  this.proc = null;

  this.stdout = '';
  this.stderr = '';
  this.exitCode = -1;
  this.signal = null;

  this.id = 0;

  this.command = '';

  // for options, see: https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
  this.options = {};
}

module.exports = Command;

Command.prototype.loadFromMessage = function (msg) {
  if (!(msg instanceof Message)) {
    return;
  }

  this.command = msg.command;

  _.merge(this.options, msg.options);

  this.id = msg.id;
};

Command.prototype.run = function (msg, callback) {
  if (_.isFunction(msg)) {
    callback = msg;
    msg = null;
  }

  if (!_.isFunction(callback)) {
    callback = _.noop;
  }

  if (msg) {
    this.loadFromMessage(msg);
  }

  if (!this.command) {
    callback(new Error('Command missing'));
    return;
  }

  this.proc = exec(this.command, this.options, function (err, stdout, stderr) {
    if (err) {
      this.exitCode = err.code;
      this.signal = err.signal;
    } else {
      this.exitCode = 0;
      this.signal = null;
    }

    this.stdout = stdout;
    this.stderr = stderr;

    var response = new Response();

    response.stdout = this.stdout;
    response.stderr = this.stderr;
    response.exitCode = this.exitCode;
    response.signal = this.signal;

    response.id = this.id;

    callback(err, response);
  }.bind(this));
};