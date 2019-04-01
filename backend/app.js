const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const dbTasks = require('./dbTasks');
const Chat = require('./models/chat');
const nodemailer = require('nodemailer');
const hrAPI = require('./hrclient')
const _ = require('lodash');
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/index",express.static(path.join(__dirname, 'angular')));

//Cross Origin headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, DELETE, PUT, OPTIONS");
    next();
});


app.get('/index',(req,res,next)=>{
    res.sendFile(path.join(__dirname,"angular","index.html"));
});

app.get('/home',(req,res,next)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.post('/chats', async function (req, res) {
    try {
        console.log('Called post function')
        // needs 'chatId', 'from' :: {user or bot}, 'message'
        let chat = await dbTasks.appendChat(req.body)
        return res.status(200).json(chat)
    }
    catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
})

app.get('/chats/:chatId', async function (req, res) {
    try {
        let chat = await dbTasks.listChat(req.params.chatId)
        //console.log('====', chat)
        return res.status(200).json(chat)
    }
    catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
})

// app.get('/createChat', async function (req, res) {
//     try {
//         dbTasks.initializeChat('aivs', (result) => {
//             if (result < 0) {
//                 //Handle error
//                 return res.status(400).send('<h1>Error occured while creating a new chat, please retry.</h1>');
//                 console.log(result);
//             } else {
//                 if (global.onlineUserSocket.hasOwnProperty('aivs')) {
//                     global.onlineUserSocket['aivs'].emit('notification', result);
//                     console.log('Notification sent to  aivs');
//                 } else {
//                     console.log('Notification couldnt be sent to aivs'  );
//                 }
//                 console.log('Successfuly added new chat to aivs');
//                 return res.status(200).send('<h1>New chat has been created successfully</h1>');




//             }
//         });
//     }
//     catch (error) {
//         console.log(error)
//         return res.status(400).send(error)
//     }
// });

app.post('/createCollection', async function (req, res) {
    let chat = new Chat(req.body)
    await chat.save()
    return res.status(200).send('SUCCESS!!')
})

app.get('/getChatList/:ldap', async function (req, res) {
    try {
        let chats = await dbTasks.getChatList(req.params.ldap)
        return res.status(200).json(chats)
    }
    catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
})

hrAPI(app);

app.post('/notifier', async function (req, res) {
    // console.log(req.body);
    var newChats = {};
    const selectedUsers = req.body.users;
    console.log('selectedUsers:', selectedUsers);
    const notification = 'Hi I am HR bot. Kindly click to start the survey.';


    let onlineSelectedUsers = _.intersection(global.onlineUsers, selectedUsers);
    let offlineusers = _.difference(selectedUsers, global.onlineUsers);

    console.log("Online Selected users :: ", onlineSelectedUsers);
    console.log('Non Online Users : ', offlineusers);

    selectedUsers.forEach(user => {
        dbTasks.initializeChat(user, (result) => {
            if (result < 0) {
                //Handle error
            } else {
                console.log('New chat saved for ' + user);
                console.log("Chat saved :: ", result);
                if (onlineSelectedUsers.includes(user)) {
                    if (global.onlineUserSocket.hasOwnProperty(user)) {
                        global.onlineUserSocket[user].emit('notification', result);
                        console.log('Notification sent to  ' + user);
                    } else {
                        console.log('Notification couldnt be sent to ' + user);
                    }
                }
            }
        });

    });



    //send Email and Socket Notification


    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'inner-relay-2.corp.adobe.com',
            port: 25,
            secure: false, // true for 465, false for other ports
            // auth: {
            //     user: account.user, // generated ethereal user
            //     pass: account.pass // generated ethereal password
            // }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: 'ccp@adobe.com', // sender address
            to: '<xxxxEmailxxxx>', // list of receivers
            subject: 'ERC survey', // Subject line
            text: 'Hello world?', // plain text body
            html: `Hi,
            <br><br>
            We reaching out to you to have a quick catch up on behalf of the Employee Resources Centre (ERC) within the Employee Experience Team.
            <br><br>
            This is a regular communication exercise which goes on throughout the year across BUs. The selection of attendees is random and the goal is to reach out to as many people as possible to draw feedback. We will discuss on topics around Check-ins – goal setting, feedback and development, things that are working well and things that are not working well for you at Adobe.
            <br><br>
            Look forward to interacting with you. Please click on the link below to start the conversation.
            <br><br>
            Link : http://or1010051248181.corp.adobe.com:3001
            <br><br><br>
            Thank you,<br>
            ERC`
            // html body
        };



        for (let user1 of offlineusers) {
            let mailOptions2 = mailOptions;
            mailOptions2.to = user1 + '@adobe.com';
            transporter.sendMail(mailOptions2, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            });
        }

    });


    res.json({ code: 200 });
});


module.exports = app;
