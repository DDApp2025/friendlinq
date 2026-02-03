import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat.service';
import { io } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css'],
})
export class AudioComponent implements OnInit {
  public socket;

  constructor(private chatService: ChatService, private router: Router) {
    this.socket = io(environment.rearGuradSocketBaseUri);
    this.socket.on('call-declined', (result) => {
      if (result) {
        const uid = localStorage.getItem('callingUserId');
        if (uid === result) {
          //this.router.navigateByUrl('/friend');
        }
      }
    });
  }

  ngOnInit(): void {
    const scriptLoaded = document.querySelector(
      'script[src="../../../../assets/js/audio.js"]'
    );
    if (scriptLoaded !== null) {
      scriptLoaded.remove();
    }
    const node1 = document.createElement('script');
    node1.src = '../../../../assets/js/audio.js';
    node1.type = 'text/javascript';
    node1.async = false;
    document.getElementsByTagName('head')[0].appendChild(node1);
  }
}
