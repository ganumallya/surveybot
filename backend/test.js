// const dbTasks = require('./dbTasks');
const luis = require('./luis');
const survey = require('./surveys/survey1.json')
const _ = require('lodash')
const qna = require('./qnamaker');
const log = require('./log.js');

// dbTasks.getQuestionID("5c2f8cc53dc488463c4c8790",(result)=>{
//   console.log(result);
// })

// console.log(dbTasks.listChat("5c2f8cc53dc488463c4c8790"));

// luis("i haven't raised any issue",(result,ent)=>{
//   if(result){
//     console.log('Top Scoring intent is :: ',result);
//   }
//   else{
//     console.log("none")
//   }

// });

// var a = survey.survey1[_.findIndex(survey.survey1,function(Item){
//   return (Item.qId == 0)
// })].subjective;
// if(a){
//   console.log('hi');
// }
// console.log(a);
//

// a = "rephrase"

// if(!a.toLowerCase().includes("busy") && !a.toLowerCase().includes("rephrase")){
//   console.log("inside")
// }


// dbTasks.updateTimeLeft("5c405b789f03750ff0254f42",40,(result)=>{
//   console.log(result);
// });


// qna("what do you do",(result)=>{
//   console.log(result);
// })

// a = ['a','b']

// timeleft = 120;

// function setTimer(socket,chatId,timeleft){
//   console.log("Setting timer for ",socket,". Remaing time :: ",timeleft);
//   if(timeleft>0){

//     var userTimeLeft = setInterval(()=>{
//       if(timeleft>0){
//         timeleft = timeleft - 1;
//         aMin = Math.floor(timeleft/60);
//         aSec = timeleft%60;
//         console.log("Time left for ",socket,": ",aMin," Minutes, ",aSec," Seconds.");
//       }else if(timeleft == 0){
//         timeleft = timeleft - 1;
//         console.log("Timer stoped for ",socket);
//         clearInterval(userTimeLeft);
//       }
//     },1000);

//   };
// };
// // console.log(a.includes('b'))

// setTimer("Ganesh","123123",10);
// setTimer("Gaurav","123123",20);


// console.log(dbTasks.getChatList("aivs"));

// i = ['asdsad','123213123']
// k = 'asdasd'

// console.log(typeof k);


// log("gmallya",0,1,0.5,"yes","i like pizza and also driving cars");

console.log("*********");
console.log("Timestamp for xxxx : ",new Date().toLocaleTimeString());
console.log("*********");
