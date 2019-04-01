import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat-service';

@Component({
  selector: 'app-chat-menu',
  templateUrl: './chat-menu.component.html',
  styleUrls: ['./chat-menu.component.css']
})
export class ChatMenuComponent implements OnInit {

  constructor( public chatService: ChatService ) {}
  private ldapID = '';
  public imageUrl = 'https://s7d2.scene7.com/is/image/IMGDIR/aivs?$100x$'
  ngOnInit() {
    this.ldapID = this.chatService.getLdap();
    this.imageUrl = this.imageUrl.replace('aivs',this.ldapID);
    console.log(this.imageUrl);
  }

}
