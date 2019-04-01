import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat-service';
import { ChatTranscript } from '../chatTranscript.model';
import { SocketService } from '../socket-service';
import { ChatList } from '../chatList.model';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.css']
})
export class ChatUiComponent implements OnInit {
  chat;
  conversation: ChatTranscript[] = [];
  conversationDetails: ChatList;
  private chatSubscription: Subscription;
  minutesRemaining: Number = 20;
  secondsRemaining: Number = 30;
  timeDisplay: String;

  buttonList = ['I am busy', 'No', 'Yes'];

  constructor(public chatService: ChatService, public socketService: SocketService,  private snackBar: MatSnackBar) {
    this.socketService.newChatRecieved()
    .subscribe((data) => {
      if (data.hasOwnProperty('chatId')) {
        console.log('casdas' , data.chatId);
      if (data.chatId == this.chat._id) {
        this.conversation.push(data);
      }
      }


    });
  }

  ngOnInit() {
    this.chatSubscription = this.chatService.chatListener()
    .subscribe((data: ChatList) => {
      this.chat = data;
      this.conversation = data.conversations;
      console.log('DATA ', this.conversation);
      this.minutesRemaining = Math.floor(data.timeLeft / 60);
      this.secondsRemaining = data.timeLeft % 60;
      let minuteDisplay: String;
      let secondsDisplay: String;
      if (this.minutesRemaining < 10) {
        minuteDisplay = '0' + this.minutesRemaining;
      } else {
        minuteDisplay = this.minutesRemaining.toString();
      }
      if (this.secondsRemaining < 10) {
        secondsDisplay = '0' + this.secondsRemaining;
      } else {
        secondsDisplay = this.secondsRemaining.toString();
      }

      this.timeDisplay = minuteDisplay + ':' + secondsDisplay;
    });


    // this.chatService.getChats("5c2dd93a67d1a3331059f8e1");

    this.socketService.TimernotificationRecieved().subscribe((data: any) => {
      console.log(data);
        this.snackBar.open(data , 'Close', {
          duration: 5000,
        });
    });
  }

   testfunc(query) {
    console.log('i got triggered');
    console.log(query);
  }

}
