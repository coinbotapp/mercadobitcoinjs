
var superagent = require('superagent');
var baseUrl = 'https://www.mercadobitcoin.net/api/';
var qs = require('qs');

var DataApi = {
  superagent: superagent,
  coin: 'bitcoin',
  version: 'v2',
  baseRequest: function(callback, method){
    var _coin = '';
    if(this.coin == 'litecoin') _coin = '_litecoin';
    return (
      this.superagent
        .get(baseUrl + method + _coin)
        .end(function(err, res){
          //console.log(err,res)
          if(err || !res.ok){
            callback(err);
          } else {
            callback(JSON.parse(res.text));
          }
        })
    );
  },
  setVersion: function(vesion){
    this.version = version;
  },
  setCoin:function(coin){
    this.coin = coin;
  },
  ticker: function(callback){
    return this.baseRequest(callback, this.version + '/ticker');
  },
  orderbook: function(callback){
    return this.baseRequest(callback, 'orderbook');
  },
  trades: function(callback, ops){
    var extra = '';
    if(ops && ops.from){
      extra = '/' + ops.from + '/' + (ops.to || '')
    }
    if(ops && (ops.tid || ops.since)){
      extra = extra + '?tid=' + (ops.tid || ops.since);
    }
    return this.baseRequest(callback, 'trades' + extra);
  }
};

exports.DataApi = DataApi;