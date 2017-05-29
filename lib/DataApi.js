
var superagent = require('superagent');
var baseUrl = 'https://www.mercadobitcoin.net/api/';

var DataApi = {
  superagent: superagent,
  ticker: function(callback){
    return (
      this.superagent
        .get(baseUrl + 'ticker')
        .end(function(err, res){
          console.log(err,res)
          if(err || !res.ok){
            callback(err);
          } else {
            callback(JSON.parse(res.text));
          }
        })
    );
  }
};

exports.DataApi = DataApi;