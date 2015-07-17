remote-control
-------------------

This is a service that allows command line commands to be run on the host it is running on.

It is distributed as a self contained package with all dependencies included.

**It is not required to install nodejs on the host system.**

Installation
-------------------
**RPM:**

`yum install remote-control`

**Other:**

* Download the `remote-control` NAR file appropriate for your system (linux/MacOS(darwin))
* Make the downloaded file executable

How to package
-------------------
### Install Dependencies

`npm install -g nar`

### Patch engine.io-client

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

### Create Packages

Mac OS:

```
nar create --executable --os darwin --arch x86 --node 0.12.7
nar create --executable --os darwin --arch x64 --node 0.12.7
```

Linux:

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

The server authenticates clients by requiring that they provide a signature in the `Authorization` header on the initial upgrade request.

The signature header should be in the following format:

`Authorization: RC <name>;<iso_8601_timestamp>;<signature>`

* `<name>`: the server will verfiy the signature using a certificate stored in /`certDir`/`<name>` on the server
* `<iso_8601_timestamp>`: an `ISO-8601` formatted timestamp.  This is the data that has been signed
* `<sig>`: a `RSA-SHA256` signature in `base64` format

### Environment Variables

* `DEBUG`: sets the level(s) for logging (default: `error,warn,info`).  `main` and `server` levels are also available for verbose logging.