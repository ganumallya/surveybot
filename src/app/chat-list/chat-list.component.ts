import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat-service';
import { ChatTranscript } from '../chatTranscript.model';
import { ChatList } from '../chatList.model';
import { SocketService } from '../socket-service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
chat: ChatList;
chatList: ChatList[] = [];
ldapID: String;

  constructor(public chatService: ChatService, public socketService: SocketService) { }

  ngOnInit() {
    this.ldapID = this.chatService.getLdap();
    this.chatService.chatListener()
    .subscribe((data: ChatList) => {
      this.chat = data;
    });

    this.chatService.getChatList(this.ldapID);

    this.chatService.chatListListener()
    .subscribe((data: [ChatList]) => {
      console.log(this.chatList);
      this.chatList = data;
    });

    this.socketService.notificationRecieved().subscribe((data: ChatList) => {
      console.log(data);
      this.chatList.unshift(data);
      this.chatService.updateChatList([...this.chatList]);
    });
  }

  api(id) {
        // this.chatService.getChats('5c2f8cc53dc488463c4c8790');
        // console.log(id)
        this.chatService.getChats(id);
      }

}
