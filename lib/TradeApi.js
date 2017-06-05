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
};

function baseParams(method, _params){
  return assign({ tapi_method: method }, _params);
};

function extractCallback(_params){
  var cb = _params.callback;
  if(!_.isFunction(cb)) throw 'missing callback param';
  delete _params.callback;
  return cb;
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

// Coerce toUpperCase and check param;
function coin(str){
  if(!str) throw 'coin param missing';
  return str.toUpperCase();
};

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
  var params = baseParams('list_system_messages', {});
  this.post(params, callback);
};

TradeApi.prototype.get_account_info = function(callback){
  var params = baseParams('get_account_info', {});
  this.post(params, callback);
};

TradeApi.prototype.get_order = function(_params){
  var params = baseParams('get_order', _params);
  var callback = extractCallback(params);

  params.coin_pair = coin_pair(params.coin_pair);

  if(!params.order_id) throw 'missing order_id';

  this.post(params, callback);
};

TradeApi.prototype.list_orders = function(_params){
  var params = baseParams('list_orders', _params);
  var callback = extractCallback(params);

  if(params.order_type) params.order_type = order_type(params.order_type);
  if(params.status_list) params.status_list = status_list(_.flatten([params.status_list]));

  this.post(params, callback);
};

TradeApi.prototype.list_orderbook = function(_params){
  var params = baseParams('list_orderbook', _params);
  var callback = extractCallback(params);

  params.coin_pair = coin_pair(params.coin_pair);

  this.post(params, callback);
};

TradeApi.prototype.place_buy_order = function(_params){
  var params = baseParams('place_buy_order', _params);
  var callback = extractCallback(params);

  params.coin_pair = coin_pair(params.coin_pair);

  if(!params.quantity) throw 'quantity param missing';
  if(!params.limit_price) throw 'limit_price param missing';

  this.post(params, callback);
};

TradeApi.prototype.place_sell_order = function(_params){
  var params = baseParams('place_sell_order', _params);
  var callback = extractCallback(params);

  params.coin_pair = coin_pair(params.coin_pair);

  if(!params.quantity) throw 'quantity param missing';
  if(!params.limit_price) throw 'limit_price param missing';

  this.post(params, callback);
};

TradeApi.prototype.cancel_order = function(_params){
  var params = baseParams('cancel_order', _params);
  var callback = extractCallback(params);

  params.coin_pair = coin_pair(params.coin_pair);

  if(!params.order_id) throw 'order_id param missing';

  this.post(params, callback);
};

TradeApi.prototype.get_withdrawal = function(_params){
  var params = baseParams('get_withdrawal', _params);
  var callback = extractCallback(params);

  params.coin = coin(params.coin);

  if(!params.withdrawal_id) throw 'withdrawal_id param missing';

  this.post(params, callback);
};

TradeApi.prototype.withdraw_coin = function(_params){
  var params = baseParams('withdraw_coin', _params);
  var callback = extractCallback(params);

  params.coin = coin(params.coin);

  if(!params.withdrawal_id) throw 'withdrawal_id param missing';
  if(!params.quantity) throw 'quantity param missing';

  if(params.coin == 'BRL' && !params.account_ref) throw 'account_ref param missing';
  else if(params.address) throw 'address param missing';

  if(params.coin == 'BTC') param.tx_fee = param.tx_fee || 0.00005;

  this.post(params, callback);
};

exports.TradeApi = TradeApi;