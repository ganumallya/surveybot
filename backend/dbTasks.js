const mongoose = require('mongoose');
const Chat = require('./models/chat');
const survey = require('./surveys/survey1.json');
const _ = require('lodash');

const defaultSurveyName = 'Chat with Tara';
const defaultSurveyId = 1;


const db = mongoose.connect('mongodb://localhost/hrchat', { useNewUrlParser: true, useCreateIndex: true }).then(() => {
    console.log('Connected to database');
}).catch(() => {
    console.log('Connection failed');
});

async function appendChat(data) {
    let chat = await Chat.findById(data.chatId)
    if (!chat)
        throw error('Chat not found')
    console.log(data.from, "::: ", data.message)
    chat.conversations.push({ from: data.from, message: data.message })
    const isSaved = await chat.save()
    if (!isSaved)
        throw error('Bad Request')
    return chat;
}

async function listChat(chatId) {
    let chat = await Chat.findById(chatId)
    //console.log(chat)
    if (!chat)
        throw error('Chat not found')
    return chat;

}

function getQuestionID(chatId,callback){
  Chat.findById(chatId)
  .then((result) => {
    callback(result.currentQuestionId);

  })
  .catch((error) => {
    console.log("Error while getting the current QuestionId");
    console.log(error);
    callback("error occured");

  });
}


function updateCurrentQuestionId(chatId,QuestionId,callback){
  Chat.findByIdAndUpdate(chatId, { $set: { currentQuestionId: QuestionId }}, { new: true }, function (err, newChat) {
    if (err){
      console.log("Error while updating question id :: " , err);
      callback("Error while updating question id");
    }

    // console.log("Updated Question Id Succesfully");
    callback("Success");
  });
}


function updateTimeLeft(chatId,timeVal,callback){
  Chat.findByIdAndUpdate(chatId, { $set: { timeLeft: timeVal }}, { new: true }, function (err, newChat) {
    if (err){
      console.log("Error while updating timeleft:: " , err);
      callback("Error while updating timeleft");
    }

    // console.log("Updated Time left Succesfully");
    callback("Success");
  });
}




async function getChatList(ldap)
{
    let chats = await Chat.find({ldap:ldap,conversationStatus: { $gt : -1}}).sort([['createdAt',-1]]);
    return chats;
}

function initializeChat(ldap,callback) {
  const defaultObject = _.find(survey.survey1, {'qId': 0});

  const chat = new Chat({
    ldap: ldap,
    conversationStatus: 0,
    conversations: [{"from":"bot","message":defaultObject.Question}],
    surveyName: defaultSurveyName,
    surveyId:defaultSurveyId,
    currentQuestionId: 0

  });

  chat.save((err)=>{
      if(err){
          console.log("Error while saving the chat" ,err)
          callback(-1)
      }
      // console.log("Chat saved succesfully");
      callback(chat);
  });

}



function updateConversationStatus(chatId,value,callback) {
    // console.log("reached update convo status ",chatId);
    Chat.findById(chatId, function (err, chat) {
        if (err) {
            console.log(err)
            callback(-1)
        }
        if (!chat) {
            console.log('Chat not found')
            callback(-1)
        }
        chat.conversationStatus = value;
        chat.save(function (err, res) {
            if (err) {
                console.log(err)
                callback(-1)
            }
            // console.log("saved");
            callback(0);
        })
    })
}


module.exports.appendChat = appendChat;
module.exports.listChat = listChat;
module.exports.getQuestionID = getQuestionID;
module.exports.updateCurrentQuestionId = updateCurrentQuestionId;
module.exports.getChatList = getChatList;
module.exports.initializeChat = initializeChat;
module.exports.updateConversationStatus = updateConversationStatus;
module.exports.updateTimeLeft = updateTimeLeft;
