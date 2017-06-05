const Entruster = require('./Entruster');
const assign = require('object-assign');
const _ = require('underscore');

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

function coin_pair(str){
  if(str && (str.toLowerCase() == 'ltc' || str.toLowerCase() == 'brlltc')) return 'BRLLTC';
  return 'BRLBTC';
};

function order_type(ot){
  if(ot == 1 || ot == '1' || ot == 'buy') return 1;
  if(ot == 2 || ot == '2' || ot == 'sell') return 2;
};

function status_list(item) {
  if(_.isArray(item)){
    return (
      _.chain(item)
       .map(function(i) { return status_list(i); })
       .flatten()
    );
  }

  if(item == 'open' || item == 2 || item == '2') return '2';
  if(item == 'cancelled' || item == 3 || item == '3') return '3';
  if(item == 'filled' || item == 4 || item == '4') return '4';

  throw item + "is ivalid status_list";
};

TradeApi.prototype.get_order = function(order_id, callback, _coin_pair){
  var params = baseParams('get_order');
  params.order_id = order_id;
  params.coin_pair = coin_pair(_coin_pair);
  this.post(params, callback);
};

TradeApi.prototype.list_orders = function(_params){
  var params = assign({}, _params, baseParams('list_orders'));
  callback = params.callback;
  delete params.callback;
  params.coin_pair = coin_pair(params.coin_pair);
  if(params.order_type) params.order_type = order_type(params.order_type);
  if(params.status_list) params.status_list = status_list(_.flatten([params.status_list]));
  this.post(params, callback);
};

exports.TradeApi = TradeApi;