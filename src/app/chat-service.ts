import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {ChatTranscript} from './chatTranscript.model';
import {ChatList} from './chatList.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
    private chats: ChatList;
    private chatCopy = new Subject();
    private chatList: ChatList[];
    private chatListCopy = new Subject();
    private surveyTimer1 = {};
    private ldapID = 'gmallya';

    constructor(private http: HttpClient) {

    }

    updateChatList(newChatList) {
        this.chatList = newChatList;
        this.chatListCopy.next([ ...this.chatList ]);

    }

    getChats(chatId) {
        this.http.get<ChatList>
        ('http://localhost:3001/chats/' + chatId)
            .subscribe(
                (chats) => {
                    this.chats = chats;
                    // console.log(this.chats)
                    this.chatCopy.next({ ...this.chats });
                }
            );
    }

    addChat(chatMssg) {
      this.chats.conversations.push(chatMssg);
      this.chatCopy.next({ ...this.chats });
    }

    chatListener() {
        return this.chatCopy.asObservable();
    }

    getChatList(ldap) {
        console.log(ldap);
        this.http.get<ChatList[]>
        ('http://localhost:3001/getChatList/' + ldap)
            .subscribe(
                (chats) => {
                    this.chatList = chats;
                    this.chatListCopy.next([ ...this.chatList ]);
                }
            );
    }

    chatListListener() {
        return this.chatListCopy.asObservable();
    }

    updateConversationStatus(val) {
        // console.log('new chatList' , this.chatList);
        for (let i = 0; i < this.chatList.length; i++) {
            if (this.chatList[i]._id == this.chats._id) {
                this.chatList[i].conversationStatus = val;
                // console.log('Changed conversation status');
            }
        }

        // console.log('Sent new chatlist', this.chatList);
        this.chatListCopy.next([...this.chatList]);
    }


    setTimerForChat(chatId) {
      console.log('Setting Timer' , this.chatList);
      if (this.surveyTimer1.hasOwnProperty(chatId)) {
        // console.log('False for starting timer');
      } else {
      this.surveyTimer1[chatId] = setInterval(() => {
        for (let i = 0; i < this.chatList.length; i++) {
          if (this.chatList[i]._id == chatId) {
              if (this.chatList[i].timeLeft > 0) {
                this.chatList[i].timeLeft = this.chatList[i].timeLeft - 1;
                // console.log("Time Left" + this.chatList[i].timeLeft);
              } else {
                this.chatList[i].timeLeft = 0;
                clearInterval(this.surveyTimer1[chatId]);
              }
          }
        }

        if (this.chats._id == chatId) {
          if (this.chats.timeLeft > 0){
            this.chats.timeLeft = this.chats.timeLeft - 1;
            // console.log( 'Time Left ' + this.chats.timeLeft);
            this.chatCopy.next({ ...this.chats });
          } else {
            this.chats.timeLeft = 0;
            clearInterval(this.surveyTimer1[chatId]);
          }
        }

      }, 1000);
    }
      this.chatListCopy.next([...this.chatList]);
  }



    endConversation() {
        this.chats.conversationStatus = -1;
        this.chatCopy.next({...this.chats});
        if (this.surveyTimer1.hasOwnProperty(this.chats._id)) {
        //   console.log('Timer Cleared');
          clearInterval(this.surveyTimer1[this.chats._id]);
        }
    }

    getLdap(){
      return this.ldapID;
    }

    getLastMessage() {
        return(this.chats.conversations[this.chats.conversations.length - 1].from);
      }

}
