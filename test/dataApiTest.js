var expect = require('chai').expect;
var superagent = require('superagent');
var nocker = require('superagent-nock').default;

var nock = nocker(superagent);

var DataApi = require('../lib/DataApi').DataApi;

describe('DataApi', function() {
  describe('#ticker()', function() {
    it('should return ticker', function() {
      var mock = nock('https://www.mercadobitcoin.net')
        .get('/api/ticker')
        .reply(200, {
          ticker: {
            high: 10101,
            low: 9550.00001,
            vol: 261.87099403,
            last: 9900,
            buy: 9900,
            sell: 9966,
            date: 1496063965
          }
        });
      DataApi.superagent = superagent;
      DataApi.ticker(function(res){
        //console.log('-------------------------------------------------------------');
        //console.log(res);
        //console.log('-------------------------------------------------------------');
        expect(res).to.equal({ticker: {high: 10101, low: 9550.00001, vol: 261.87099403, last: 9900, buy: 9900, sell: 9966, date: 1496063965 } }) });
      });
  });
});