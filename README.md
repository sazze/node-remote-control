remote-control
-------------------

This is a service that allows command line commands to be run on the host it is running on.

It is distributed as a self contained package with all dependencies included.

**It is not required to install nodejs on the host system.**

Clients
-------------------

[rc-client](https://github.com/sazze/node-rc-client) is the official client library for interacting with this service.

Installation
-------------------
**!! DO NOT INSTALL THIS PACKAGE VIA NPM !!**

**RPM:**

`yum install remote-control`

*Note: creation of an RPM package is still on the TODO list

**Other:**

* Download the `remote-control` NAR file appropriate for your system (linux/MacOS(darwin)) from the [releases](https://github.com/sazze/node-remote-control/releases)
* Make the downloaded file executable

**Example Init Script (RedHat/Centos):**

```bash
#!/bin/bash
#
#	/etc/rc.d/init.d/rc
#
#	This is a service that allows command line commands to be run on the host it is running on.
#
# chkconfig: 2345 20 80
# description: This is a service that allows command line commands to be run on the host it is running on.
# processname: rc
# config: /etc/rc/config.json
# pidfile: /var/run/rc.pid
#

# Source function library.
. /etc/init.d/functions

PROGNAME=rc
PROG=/usr/local/sbin/$PROGNAME
PIDFILE=/var/run/${PROGNAME}.pid
CONFIGFILE=/etc/$PROGNAME/config.json
LOCKFILE=/var/lock/subsys/$PROGNAME

start() {
    if [ -d /.nar ]; then
        # ensure clean start (nar agressively caches code)
        rm -rf /.nar
    fi
    
	echo -n "Starting $PROGNAME: "
	daemon $PROG --configFile $CONFIGFILE
	ret=$?
	echo ""
	touch $LOCKFILE
	return $ret
}

stop() {
	echo -n "Shutting down $PROGNAME: "
	killproc -p $PIDFILE $PROG
	ret=$?
	echo ""
	rm -f $LOCKFILE
	return $ret
}

case "$1" in
    start)
	start
	;;
    stop)
	stop
	;;
    status)
	status -p $PIDFILE -l $LOCKFILE
	;;
    restart)
    stop
	start
	;;
    *)
	echo "Usage: <servicename> {start|stop|status|reload|restart[|probe]"
	exit 1
	;;
esac
exit $?
```

How to package
-------------------
### Install Dependencies

`npm install -g nar`

**IMPORTANT: DO NOT USE nar@0.3.40** it has a bug where it will not bundle the application files (nar@0.3.39 is known to work)

### Create Packages

Mac OS:

remote-control version >= 1.1.0:

```
nar create --executable --os darwin --arch x64 --node 6.9.5
```

remote-control version <= 1.0.0:

```
nar create --executable --os darwin --arch x86 --node 0.12.7
nar create --executable --os darwin --arch x64 --node 0.12.7
```

Linux:

remote-control version >= 1.1.0:

```
nar create --executable --os linux --arch x86 --node 6.9.5
nar create --executable --os linux --arch x64 --node 6.9.5
```

remote-control version <= 1.0.0:

```
nar create --executable --os linux --arch x86 --node 0.12.7
nar create --executable --os linux --arch x64 --node 0.12.7
```

Configuration
-------------------
Configuration is specified in a JSON formated file and passed to the service using the `--configFile` command line flag.

```
remote-control exec [--configFile FILE] [--version]
```

The configuration file understands the following options:

* `port`: the port to listen on (default: `4515`)
* `host`: the interface to bind to (default: `::`)
* `certDir`: the directory where authorized users' public keys are stored (default: `/etc/rc/certs`)
* `ciphers`: the list of cyphers to use
* `engineOptions`:
    * `pingTimeout`: ping timeout in ms (default: `5000`)
    * `pingInterval`: pint interval in ms (default: `1000`)
* `pidFile`: the pid file to write (default: `null`)
* `cmdOptions`: the options used by the child processes running the commands (default: `{}`).  Can be overriden by options set on the message.  See [`child_process_exec_command_options`](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) for valid options

The server authenticates clients by requiring that they provide a signature in the `Authorization` header on the initial upgrade request.

The signature header should be in the following format:

`Authorization: RC <name>;<iso_8601_timestamp>;<signature>`

* `<name>`: the server will verfiy the signature using a certificate stored in `<certDir>/<name>.key` on the server
* `<iso_8601_timestamp>`: an `ISO-8601` formatted timestamp.  This is the data that has been signed
* `<sig>`: a `RSA-SHA256` signature in `base64` format

### Environment Variables

* `DEBUG`: sets the level(s) for logging (default: `error,warn,info`).  `main` and `server` levels are also available for verbose logging.

Testing
-------------------

You can test client actions with `test/scripts/client.js`

**NOTES:** 

* set the `SZ_RC_CERT_NAME` and `SZ_RC_CERT_DIR` environment variables before running the client test script.
* place your public key in `/tmp/rcPubKeys`
* run the server: `node app.js --configFile ./test/config/config.json`

### Patch engine.io-client (only for versions of remote-control <= 1.0.0)

If your version of engine.io-client is <=1.5.2, it must be patched.

First update engine.io-client to version 1.5.2, then follow the steps below:

```bash
cd node_modules/engine.io-client
patch -p1 < ../../package/patches/engine.io-client/1.5.2-master-2015-07-16.patch
#
# when prompted for files to modify, just hit enter and then
# select 'Y' to skip the file
#
npm install
```

### Environment Variables

* `SZ_RC_CERT_NAME`: the name of the cert for the client to use for authorization (see `name` in the config options)
* `SZ_RC_CERT_DIR`: the path to the directory that contains the cert

License
-------------------

ISC License (ISC)

Copyright (c) 2016, Sazze, Inc.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.