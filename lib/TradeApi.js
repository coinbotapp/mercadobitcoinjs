const Entruster = require('./Entruster');
var Credentials = require('./CredentialsFromEnvironment')();

function header(signature) {
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

TradeApi.prototype.post = function(params, callback) {
  params.tapi_nonce = Entruster.tapiNonce();
  var signature = Entruster.sign(Credentials.tapi_secret, params);

  var request = this.superagent
                  .post(this.baseUrl)
                  .send(params);
};
  // TODO HEADER
//     .header(header(signature))

//   result = JSON.parse(
//     RestClient.post(
//       base_url,
//       params.to_query_string,
//       header(signature)
//     )
//   )
//   deal_with_errors(result)
// rescue MercadoBitcoin::TonceAlreadyUsed
//   retry
// end


TradeApi.prototype.list_system_messages = function(){

};

exports.TradeApi = TradeApi;