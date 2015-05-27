/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

module.exports = {
  port: 4515,
  host: '::',
  caUrl: null,
  crlUrl: null,
  ca: null,
  crl: null,
  ciphers: 'EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4',
  engineOptions: {
    pingTimeout: 5000,
    pingInterval: 1000
  },
  pidFile: null
};