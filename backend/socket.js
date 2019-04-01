var io = require("socket.io")();
const _ = require("lodash");
let dbTasks = require("./dbTasks");
const survey = require("./surveys/survey1.json");
global.onlineUsers = [];
global.onlineUserSocket = {};
global.analyticsHelper = {};  //JSON with LDAP as key and value will be a json with intent,previous response, and parent QID . This is used to store the context of previous "NO" intent response and append that with please elaborate your response question's response.
const luis = require("./luis");
const qna = require("./qnamaker");
global.userTimer = {};

io.on("connection", socket => {
  // Fetching ldap id from the socket connection
  socket.userLdapID = socket.handshake.query.name;
  console.log(socket.handshake.query.name, "connected !!");
  global.onlineUsers.push(socket.handshake.query.name);
  console.log(global.onlineUsers);
  global.onlineUserSocket[socket.userLdapID] = socket;
  global.analyticsHelper[socket.userLdapID] = {
    parentQid : 0,
    pIntent : "",
    pResponse : ""
  };

  //Remove the ldap id from the online user list when socket is disconnected
  socket.on("disconnect", function() {
    console.log(socket.userLdapID + " disconnected");
    _.remove(global.onlineUsers, function(n) {
      if (n) {
        return n.toLowerCase() == socket.userLdapID.toLowerCase();
      }
    });
    delete global.onlineUserSocket[socket.userLdapID];
    console.log(global.onlineUsers);
  });

  /**
   * Socket event when any chat message is recieved
   * Input Parameter "Data" is an object with three fields
   * 1) chatID : Conversation ID (_id of the conversation)
   * 2) message : Chat message sent
   * 3) from : user or bot
   */

  socket.on("chat message", function(data) {
    // console.log("Chat message recieved :: ", data);
    dbTasks.appendChat(data); //Logging the data received to Mongo DB
    data2 = { ...data }; //Making copy of the data recieved.
    data2.from = "bot";

    var currentQuestionId = 0; //Declaring currentQuestionID

    //Get the actual currentQuestionID from MongoDB
    dbTasks.getQuestionID(data.chatId, result => {
      //If the questionID doesnt exist in Survey

      // console.log("result of get Question Id :: ", result);

      //Check if it is the first response from the user for the survey
      if (result == 0) {
        //Start the timer
        setTimer(socket.userLdapID,data.chatId,3600);

        //Update the conversation status to 1
        dbTasks.updateConversationStatus(data.chatId, 1, data => {
          // console.log(data);
        });
      }
      if (typeof result == "string" && result.toLowerCase().includes("error")) {
        data2.message = "Something went wrong, please check the logs in server";
        socket.emit("chat message", data2, false);
      } else {
        //Declarations
        currentQuestionId = result;
        currentQuestionObject =
          survey.survey1[
            _.findIndex(survey.survey1, function(Item) {
              return Item.qId == currentQuestionId;
            })
          ];
        var botResponse = "Sorry i am unable to answer this question";
        var end = false;
        var nextQuestionId;
        var intentFromLuis = "none";

        // console.log("Current question object :: ", currentQuestionObject);

        //Understand the intent behind the response and get the correction optionId

        if (currentQuestionObject.subjective) {

          //Get intent of the user query
          luis(data.message, (result,ent) => {
            intentFromLuis = result.intent.toLowerCase();
            // console.log("Intent Identified :: ", intentFromLuis);

            if (
              (intentFromLuis.includes("busy") ||
              intentFromLuis.includes("question") ||
              intentFromLuis.includes("clarification")) && (currentQuestionObject.subjective < 2)
            ) {

              //Check if intent is available in responses object
              if (currentQuestionObject.responses.hasOwnProperty(result.intent.toLowerCase())) {
                nextQuestionId = currentQuestionObject.responses[result.intent];

                //Hackaround for a custom role for Q0 with respect to gathering date and time.
                if(currentQuestionId == 0){
                if(ent.length>0){
                  if(ent[0].hasOwnProperty["type"]){
                    if(ent[0].type == 'builtin.datetimeV2.datetime'){
                      nextQuestionId = currentQuestionObject.responses[result.intent];
                    }
                  }
                }else{
                  nextQuestionId = 21
                }};


                //Get next question object
                var nextQuestionObject =
                  survey.survey1[
                    _.findIndex(survey.survey1, function(Item) {
                      return Item.qId == nextQuestionId;
                    })
                  ];

                //Check if this will be end of the survey
                if (nextQuestionObject.end) {
                  end = true;
                  if(global.userTimer.hasOwnProperty(data2.chatId)){
                    clearInterval(global.userTimer[data2.chatId]);
                  }

                }

                botResponse = nextQuestionObject.Question;

                data2.from = "bot";
                data2.message = botResponse;

                emitChat({ ...data2 }, nextQuestionId, end, socket);

              }else{
                  // console.log('Survey doesnt have any intent for this question id ',currentQuestionId);
                  data2.from="bot"
                  data2.message = "Sorry, I didn’t understand what you meant. Let’s try again"
                  emitChat({ ...data2 }, currentQuestionId, false, socket);
              }
            } else {
              //Getting next question id by using yes intent
              nextQuestionId = currentQuestionObject.responses["yes"];
              // console.log("Next Question ID :: ", nextQuestionId);

              //Get Next Question Object
              var nextQuestionObject =
                survey.survey1[
                  _.findIndex(survey.survey1, function(Item) {
                    return Item.qId == nextQuestionId;
                  })
                ];

              //Check if this will be end of the survey
              if (nextQuestionObject.end) {
                end = true;
                dbTasks.updateConversationStatus(data.chatId, -1, data => {
                  // console.log(data);
                });
              }

              botResponse = nextQuestionObject.Question;

              data2.from = "bot";
              data2.message = botResponse;



              //Log to analytics Table
              if (currentQuestionObject.parentQid >= 0){
                // console.log(currentQuestionObject.parentQid);
                // console.log(global.analyticsHelper[socket.userLdapID].parentQid);
                if(currentQuestionObject.parentQid == global.analyticsHelper[socket.userLdapID].parentQid){
                  logInAnalyticsTable(socket.userLdapID,currentQuestionObject.parentQid,data2.chatId,0.0,global.analyticsHelper[socket.userLdapID].pIntent,global.analyticsHelper[socket.userLdapID].pResponse + ", " + data.message );
                }else{
                  // logInAnalyticsTable(socket.userLdapID,currentQuestionObject.parentQid,data2.chatId,0.0,"none",data.message);
                }
            }
            emitChat({ ...data2 }, nextQuestionId, end, socket);
            }
          });
        } else {
          //If its not a subjective question use luis to get intent
          console.log("*********");
          console.log("Sending request to Luis :: Timestamp : ",new Date().toLocaleTimeString());
          console.log("*********");
          luis(data.message, (result,ent) => {
            console.log("*********");
            console.log("Recieved response from Luis :: Timestamp : ",new Date().toLocaleTimeString());
            console.log("*********");
            if(result){
              intentFromLuis = result.intent.toLowerCase();
            }
            else{
              intentFromLuis = "none";
            }

            // console.log("Intent Identified :: ", intentFromLuis);

            //Check if intent is available in responses object
            if (currentQuestionObject.responses.hasOwnProperty(result.intent.toLowerCase())) {
              nextQuestionId = currentQuestionObject.responses[result.intent];
              if (currentQuestionObject.parentQid >= 0){
                if(intentFromLuis == "yes"){
                    logInAnalyticsTable(socket.userLdapID,currentQuestionObject.parentQid,data.chatId,0.0,intentFromLuis,data.message);
                }else if(intentFromLuis == "no"){

                  global.analyticsHelper[socket.userLdapID].parentQid = currentQuestionObject.parentQid;
                    global.analyticsHelper[socket.userLdapID].pIntent = "no";
                    global.analyticsHelper[socket.userLdapID].pResponse = data.message;
                    // logInAnalyticsTable(socket.userLdapID,currentQuestionObject.parentQid,data.chatId,0.0,intentFromLuis,data.message);
                }
             }
            } else if (result.intent.toLowerCase() == "rephrase") {
              botResponse =
                currentQuestionObject.alternateQ[
                  Math.floor(
                    Math.random() * currentQuestionObject.alternateQ.length
                  )
                ];
              nextQuestionId = currentQuestionId;
            }
            else if (result.intent.toLowerCase() == "none") {
              console.log("*********");
              console.log("sending the message to QnaMaker :: Timestamp : ",new Date().toLocaleTimeString());
              console.log("*********");
              botResponse = "QnaMaker";
              nextQuestionId = currentQuestionId;
              qna(data.message, result => {
                console.log("*********");
                console.log("Recieved the message from QnaMaker :: Timestamp : ",new Date().toLocaleTimeString());
                console.log("*********");
                // console.log("QnaMakerResponse :: ", result);
                if(result.toLowerCase().includes('no good match found in kb')){
                  result = "Sorry, I didn’t understand what you meant. Let’s try again"
                }
                data2.message = result;
                nextQuestionId = currentQuestionId;
                emitChat({ ...data2 }, nextQuestionId, false, socket);
              });
            }
            else {
              intentFromLuis = "none"; //Out of scope
              botResponse = "Sorry, I didn’t understand what you meant. Let’s try again";
              data2.from ="bot";
              data2.message=botResponse;
              nextQuestionId = currentQuestionId;
              emitChat({ ...data2 }, nextQuestionId, false, socket);
            }

            if (!intentFromLuis.toLowerCase().includes("none")) {
              if (!intentFromLuis.toLowerCase().includes("rephrase")) {
                //Belongs to any intent other than none and rephrase
                //Get Next Question Object
                var nextQuestionObject =
                  survey.survey1[
                    _.findIndex(survey.survey1, function(Item) {
                      return Item.qId == nextQuestionId;
                    })
                  ];

                //Check if this will be end of the survey
                if (nextQuestionObject.end) {
                  end = true;
                }

                botResponse = nextQuestionObject.Question;
              }

              data2.from = "bot";
              data2.message = botResponse;

              emitChat({ ...data2 }, nextQuestionId, end, socket);

            }
          });
        }
      }
    });
  });
});

module.exports = io;

function emitChat(chatData, nextQuestionId, end, socketConnection) {

  if (end) {
    if(global.analyticsHelper.hasOwnProperty(socketConnection.userLdapID)){
      delete global.analyticsHelper[socketConnection.userLdapID];
    }

    if(global.userTimer.hasOwnProperty(data2.chatId)){
      clearInterval(global.userTimer[chatData.chatId]);
    }

    dbTasks.updateConversationStatus(chatData.chatId, -1, data => {
      // console.log(data);

    });
  }


  if(typeof chatData.message == "object"){
    for(i=0;i<chatData.message.length;i++){
      ChatdataCopy = {...chatData};
      ChatdataCopy.message = ChatdataCopy.message[i];


      dbTasks.appendChat(ChatdataCopy);

      //Updating the CurrentQuestionID in MongoDb
      dbTasks.updateCurrentQuestionId(ChatdataCopy.chatId, nextQuestionId, result => {
        if (result.toLowerCase().includes("error")) {
          ChatdataCopy.message = "Something went wrong, please check the server logs";
        }

      });
      //Emit Socket
      socketConnection.emit("chat message", ChatdataCopy, end);



    };
  }else{
    dbTasks.appendChat(chatData);
    // console.log("Next Question ID :: ", nextQuestionId);
    //Updating the CurrentQuestionID in MongoDb
    dbTasks.updateCurrentQuestionId(chatData.chatId, nextQuestionId, result => {
      if (result.toLowerCase().includes("error")) {
        chatData.message = "Something went wrong, please check the server logs";
      }
    });

    //Emit Socket
    socketConnection.emit("chat message", chatData, end);
  }

}


function setTimer(ldapId,convChatId,remTime){
  // console.log("Setting timer for ",ldapId,". Remainingg time :: ",remTime);
  if(remTime>0){

    global.userTimer[convChatId] = setInterval(()=>{
      if(remTime>0 && remTime !=30 ){
        remTime = remTime - 1;
        aMin = Math.floor(remTime/60);
        aSec = remTime%60;
        // console.log("Time left for ",ldapId,": ",aMin," Minutes, ",aSec," Seconds.");
        dbTasks.updateTimeLeft(convChatId,remTime,(result)=>{
          // console.log(result);
        });
      }else if(remTime == 30){
        remTime = remTime - 1;
        dbTasks.updateTimeLeft(convChatId,remTime,(result)=>{
          // console.log(result);
        });
        data2 = {
          from:"bot",
          chatId:convChatId,
          message:"You have just few seconds remaining before the survey time expires"
        }
        // dbTasks.appendChat(data2);
        if(global.onlineUserSocket.hasOwnProperty(ldapId)){
          console.log('i am sending the notification')
          global.onlineUserSocket[ldapId].emit("Timer",data2.message);
        }

      }else if(remTime == 0){
        remTime = remTime - 1;
        dbTasks.updateTimeLeft(convChatId,0,(result)=>{
          // console.log(result);
        });
        data2 = {
          from:"bot",
          chatId:convChatId,
          message:"Your survey chat has expired"
        }
        // dbTasks.appendChat(data2);

        console.log("Timer stoped for ",ldapId);
        dbTasks.updateConversationStatus(convChatId, -2 , data => {
          // console.log(data);
        });
        // dbTasks.updateConversationStatus(convChatId.)
        clearInterval(global.userTimer[convChatId]);
        if(global.onlineUserSocket.hasOwnProperty(ldapId)){
          global.onlineUserSocket[ldapId].emit("Timer",data2.message);
        }
        console.log("expirey message sent")
      }
    },1000);

  };
};


function logInAnalyticsTable(ldapID,Qid,Cid,sentimentScore,responseIntent,response){
  console.log("=============Log========================");
console.log(ldapID,Qid,Cid,sentimentScore,responseIntent,response);
console.log("=============Log========================");
}
