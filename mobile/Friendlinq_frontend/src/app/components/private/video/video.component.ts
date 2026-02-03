import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
})
export class VideoComponent implements OnInit {
  public socket;

  constructor(private router: Router) {
    this.socket = io(environment.rearGuradSocketBaseUri);
    this.socket.on('call-declined', (result) => {
      if (result) {
        const uid = localStorage.getItem('callingUserId');
        if (uid === result) {
          // this.router.navigateByUrl('/friend');
        }
      }
    });
  }

  ngOnInit(): void {
    const scriptLoaded = document.querySelector(
      'script[src="../../../../assets/js/video.js"]'
    );
    if (scriptLoaded !== null) {
      scriptLoaded.remove();
    }
    const node1 = document.createElement('script');
    node1.src = '../../../../assets/js/video.js';
    node1.type = 'text/javascript';
    node1.async = false;
    document.getElementsByTagName('head')[0].appendChild(node1);
  }
}
