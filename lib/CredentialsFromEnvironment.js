/* from https://github.com/adilsoncarvalho/mercadobitcoin-stop */

module.exports = () => {
  if (process.env.TAPI_ID === undefined || process.env.TAPI_SECRET === undefined) {
    return undefined;
  }

  return { tapi_id: process.env.TAPI_ID, tapi_secret: process.env.TAPI_SECRET };
};