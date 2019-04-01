var request = require("request");

var options = { method: 'GET',
  url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a0841ac3-b1c9-4c04-8cf4-b8b002bd1baf',
  qs:
   { verbose: 'true',
     timezoneOffset: '-360',
     'subscription-key': 'fcdbfbfdbcbf42c2b48487dcfdd91e4e',
     q: '' },
  headers:
   { 'cache-control': 'no-cache' } };





module.exports = (query,callback) => {
  newOptions =  {...options};
  newOptions.qs.q = query;
  // console.log(newOptions);
  request(newOptions, function (error, response, body) {
    if (error) throw new Error(error);
    
    // console.log(JSON.parse(body));

    callback(JSON.parse(body).topScoringIntent,JSON.parse(body).entities);
  });
}
