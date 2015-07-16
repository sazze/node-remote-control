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
* `caUrl`: the URL to load the ca cert from (default: `null`)
* `crlUrl`: the URL to load the crl from (default: `null`)
* `ca`: the ca cert (default: `null`)
* `crl`: the crl (default: `null`)
* `ciphers`: the list of cyphers to use
* `engineOptions`:
    * `pingTimeout`: ping timeout in ms (default: `5000`)
    * `pingInterval`: pint interval in ms (default: `1000`)
* `pidFile`: the pid file to write (default: `null`)

The server authenticates clients by requiring that they provide a cert that is signed by the ca specified in the `caUrl` or `ca` options.

If `caUrl` or `crlUrl` options are specified, the resource is downloaded from the URL provided on every request to the server.

### Environment Variables

* `DEBUG`: sets the level(s) for logging (default: `error,warn,info`).  `main` and `server` levels are also available for verbose logging.