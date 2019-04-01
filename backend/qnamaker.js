var request = require("request");


var qnamakerConfig = {
    knowledgeBaseId: process.env.Hr_QNA_KBID || 'f18a9094-728c-40b7-9c97-29b1d73e1327',
    authKey: process.env.Hr_QNA_KEY || '06d1bb7e-c586-481d-8627-97f6bacf0971',
    endpointHostName: process.env.QNA_HOST || 'https://sdbotqnamaker.azurewebsites.net/qnamaker',
    top: 1};


module.exports = (query,callback) => {
    var options = { method: 'POST',
    url: `${qnamakerConfig.endpointHostName}/knowledgebases/${qnamakerConfig.knowledgeBaseId}/generateAnswer`,
    headers:
        { 'cache-control': 'no-cache',
            'Content-Type': 'application/json',
            Authorization: 'EndpointKey '+qnamakerConfig.authKey },
            body: { question: query },
            json: true };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        if(body.answers[0].score >= 0){
            // console.log(body.answers[0].answer);
            // console.log(body.answers[0].score)
            callback(body.answers[0].answer);
        }else{
            // console.log(body.answers[0].answer);
            // console.log(body.answers[0].score)
            callback("sorry i dont know  how to answer that");
        }

    });

};
