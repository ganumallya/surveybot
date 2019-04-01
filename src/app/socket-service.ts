import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatService } from './chat-service';
import { ChatList } from './chatList.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
    constructor(private chatService: ChatService) {

    }



private SocketOption = {
    query: {
      name: this.chatService.getLdap(),
    },
    forceNew: false
  };

  private socket = io('http://localhost:3001', this.SocketOption);

  sendChatMessage(data) {
    this.socket.emit('chat message', data);
  }

  newChatRecieved() {
        const observable = new Observable<any> (observer => {
            this.socket.on('chat message', (data, end) => {
                console.log("Message recieved ",data);
                if (end) {
                    console.log("end message recieved")
                    this.chatService.endConversation();
                }
                observer.next(data);
            });
            return () => { this.socket.disconnect(); };
        });

        return observable;
    }

    notificationRecieved() {
        const observable = new Observable<ChatList>(observer => {
            this.socket.on('notification', (newChat) => {
                observer.next(newChat);
            });
            return () => { this.socket.disconnect(); };
        });

        return observable;
    }

    TimernotificationRecieved() {
        const observable = new Observable<String>(observer => {
            this.socket.on('Timer', (res) => {
                observer.next(res);
            });
            return () => { this.socket.disconnect(); };
        });

        return observable;
    }


}
