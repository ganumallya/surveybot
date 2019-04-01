var request = require("request");

var options = { method: 'POST',
  url: 'http://localhost:5000/wordcloud',
  headers:
   { 'Postman-Token': '194245f5-9840-4c2e-a519-31b564c62503',
     'cache-control': 'no-cache',
     'Content-Type': 'application/json' },
  body:
   { sentence: 'i love the food and promotions here',
     convoid: 1213123123,
     ldapid: 'gmallya',
     sentimentscore: 0.5,
     intent: 'yes',
     qid: 2 },
  json: true };



module.exports = (ldapID,Qid,Cid,sentimentScore,responseIntent,response)=>{
  newOptions = {...options};
  newOptions.body.sentence = response;
  newOptions.body.ldapid = ldapID;
  newOptions.body.sentimentscore = sentimentScore;
  newOptions.body.convoid = Cid;
  newOptions.body.intent = responseIntent;
  newOptions.body.qid = Qid;

  request(newOptions, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);

  });

}
