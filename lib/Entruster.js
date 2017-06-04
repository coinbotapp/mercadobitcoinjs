/* adapted from https://github.com/adilsoncarvalho/mercadobitcoin-stop */

const querystring = require('qs');
const crypto      = require('crypto');

const BASE_URI = '/tapi/v3/?';

var tapiNonce = 0;

exports.tapiNonce = function() {
    return ++tapiNonce;
};

exports.setTapiNonce = function(num){
  tapiNonce = num;
};

exports.sign = function(tapi_secret, params) {
  var hmac    = crypto.createHmac('sha512', tapi_secret);
  var payload = BASE_URI + querystring.stringify(params);
  hmac.update(payload);

  return hmac.digest('hex');
};