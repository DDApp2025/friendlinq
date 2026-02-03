import { Component, OnInit } from '@angular/core';
// import { ChatService } from './shared/services/chat.service'; // Commented out to stop the 'ghost' noise

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // constructor(private chatService: ChatService) {} // Neutralized the service call
  constructor() {} 
  
  title = 'FriendLinq'; // Renamed from rearguard
  
  ngOnInit(): void {}
}
