const Entruster = require('./Entruster');

console.log(Entruster);

var Credentials = require('./CredentialsFromEnvironment')();
var superagent = require('superagent')

function headers(signature) {
  return {
  'Content-Type': 'application/x-www-form-urlencoded',
  'TAPI-ID': Credentials.tapi_id,
  'TAPI-MAC': signature
  };
}

function baseParams(method){
  return {
    tapi_method: method
  };
}


const TradeApi = function(tapi_id, tapi_secret){
  if(tapi_secret && tapi_id){
    Credentials = { tapi_id: tapi_id, tapi_secret: tapi_secret };
  }
  if(!Credentials){
    throw 'no tapi_id and tapi_secret provided';
  }
  this.superagent = require('superagent');
  this.baseUrl = 'https://www.mercadobitcoin.net/tapi/v3/';
};

TradeApi.prototype.dealWithResponse = function(params, callback, err, res){
  if(err){ return; } // TODO: do something

  var response = res.body;

  if(response.status_code == 203){
    this.dealWithNonceAlreadyused(params, callback, response);
    return;
  }

  callback(response);
};

TradeApi.prototype.dealWithNonceAlreadyused = function(params, callback, response) {
  var matched = response.error_message.match(/utilizado: (\d+)/);
  if(matched){
    Entruster.setTapiNonce(parseInt(matched[1]));
    this.post(params, callback);
  }
};

TradeApi.prototype.post = function(params, callback) {
  params.tapi_nonce = Entruster.tapiNonce();
  var signature = Entruster.sign(Credentials.tapi_secret, params);

  this.superagent
      .post(this.baseUrl)
      .send(params)
      .set(headers(signature))
      .end(this.dealWithResponse.bind(this, params, callback));
};

TradeApi.prototype.list_system_messages = function(callback){
  var params = baseParams('list_system_messages');
  this.post(params, callback);
};

TradeApi.prototype.get_account_info = function(callback){
  var params = baseParams('get_account_info');
  this.post(params, callback);
};

TradeApi.prototype.coin_pair = function(str){
  if(str && (str.toLowerCase() == 'ltc' || str.toLowerCase() == 'brlltc')) return 'BRLLTC';
  return 'BRLBTC';
};

TradeApi.prototype.get_order = function(order_id, callback, coin_pair){
  var params = baseParams('get_order');
  params.order_id = order_id;
  params.coin_pair = this.coin_pair(coin_pair);
  this.post(params, callback);
};

exports.TradeApi = TradeApi;