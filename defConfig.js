/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

module.exports = {
  port: 4515,
  host: '::',
  certDir: '/etc/rc/certs',
  ciphers: 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4',
  engineOptions: {
    pingTimeout: 5000,
    pingInterval: 1000
  },
  pidFile: null
};