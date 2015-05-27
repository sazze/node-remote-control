remote-control
-------------------

This is a service that allows command line commands to be run on the host it is running on.

It is distributed as a self contained package with all dependencies included.

**It is not required to install nodejs on the host system.**

How to package
-------------------
### Install Dependencies

`npm install -g nar`

### Create Packages

Mac OS:

```
nar create --executable --os darwin --arch x86 --node 0.12.4
nar create --executable --os darwin --arch x64 --node 0.12.4
```

Linux:

```
nar create --executable --os linux --arch x86 --node 0.12.4
nar create --executable --os linux --arch x64 --node 0.12.4
```