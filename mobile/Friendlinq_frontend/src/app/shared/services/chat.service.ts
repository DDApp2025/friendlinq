import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private url = 'https://rearguardwebsocket.devdevelopment.net/';
  private socket;

  constructor() {
    this.socket = io(this.url);
  }

  public sendMessage(message) {
    this.socket.emit('new-message', message);
  }
  public sendCallRequest(message) {
    this.socket.emit('call-request', message);
  }
  public getMessages = () => {
    return new Observable((observer) => {
      this.socket.on('new-message-received', (message) => {
        observer.next(message);
      });
    });
  };
  public getCallRequestResponse = () => {
    return new Observable((observer) => {
      this.socket.on('call-request-received', (message) => {
        observer.next(message);
      });
    });
  };
}
