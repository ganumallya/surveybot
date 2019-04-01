import { Component , ViewChild, ElementRef } from '@angular/core';
import { SocketService } from './socket-service';
import { Subscription } from 'rxjs';
import { ChatService } from './chat-service';
import { ChatTranscript } from './chatTranscript.model';
import { CATCH_STACK_VAR } from '../../node_modules/@angular/compiler/src/output/output_ast';
import { ChatList } from './chatList.model';
import { NgForm } from '@angular/forms';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  isDisabled = false;
  chat: ChatList;
  private chatSubscription: Subscription;
  title = 'hrchat-app';
  chatMessage: String;
  @ViewChild('scrollMe', {read: ElementRef}) tref: ElementRef;

  constructor(private socketService: SocketService, public chatService: ChatService, private snackBar: MatSnackBar ) {

    this.socketService.newChatRecieved()
    .subscribe((data) => {
      // this.chat.conversationStatus = 1;
      let el = this;
      setTimeout(function() {
        try {
          // console.log('Called Scroll1', el.tref.nativeElement.scrollHeight);
          const aheight = el.tref.nativeElement.scrollHeight + 1500;
          // console.log('Called Scroll2', aheight);
          el.tref.nativeElement.scrollTop = aheight;
          // console.log('Called Scroll3', el.tref);
        } catch (err) {
          console.log('There was a error ', err);
         }
      }, 0);
    });

  }

  ngOnInit() {

    this.chatSubscription = this.chatService.chatListener()
    .subscribe((data:
      ChatList) => {
      this.chat = data;
      if (this.chat.conversationStatus !== 0) {
        this.chatService.setTimerForChat(this.chat._id);
      }
      // console.log('chat from app component ', this.chat);
    });
    // this.chatService.getChats("5c2dd93a67d1a3331059f8e1");
  }

  onNewMessage(form: NgForm) {
    console.log('New Mssg entered by user', form.value.newmsg);
    if (this.chat.conversationStatus === 0 && form.value.newmsg && form.value.newmsg.trim().length > 0) {
      this.chatService.updateConversationStatus(1);
      this.chatService.setTimerForChat(this.chat._id);
    }


    if (form.value.newmsg ) {
      console.log('1');
      if (form.value.newmsg.trim().length > 0) {
        let lastMessage = this.chatService.getLastMessage();
        if (lastMessage != 'user') {
        this.socketService.sendChatMessage({'chatId': this.chat._id , 'from': 'user', 'message': form.value.newmsg});
        this.chatService.addChat({ '_id': null, 'from': 'user', 'message': form.value.newmsg});
        form.resetForm();
        try {
          // console.log('Called Scroll1', this.tref.nativeElement.scrollHeight);
          const aheight = this.tref.nativeElement.scrollHeight + 1500;
          // console.log('Called Scroll2', aheight);
          this.tref.nativeElement.scrollTop = aheight;
          // console.log('Called Scroll3', this.tref);
        } catch (err) {
          console.log('There was a error ', err);
         }
      }else{
        console.log('Wait till bot responds');
        this.snackBar.open('Please wait...' , 'Close', {
          duration: 5000,
        });
        form.resetForm();
      }
    }
    } else if (typeof form.value.newmsg == 'undefined') {
      console.log('No undefined');
      form.resetForm();
    } else {
      console.log('No empty message');
      form.resetForm();
    }

    // this.chatMessage = '';

  }


}
