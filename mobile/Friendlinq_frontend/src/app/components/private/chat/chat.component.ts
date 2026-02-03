import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { makeArray } from 'jquery';
import { AuthService } from 'src/app/shared/api/auth.service';
import { AudioRecordingService } from 'src/app/shared/services/audio-recording.service';
import { ChatService } from 'src/app/shared/services/chat.service';
import { Chat, ChatMedia, SendMessage } from '../../models/chat.model';
import { FriendRequest } from '../../models/friend.model';
import { DataService } from '../../public/service/data.service';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;
  public friendsList: any;
  public originalFriendsList: any;

  public chatMessagesList: any;
  message: string;
  showloader: string;
  chatScreen: string;
  chatHeader: string;
  firstFriend: any;
  userDetails: any;
  imageSrc: string;
  format: string;
  preview: string;
  uploadedFile: any;
  isRecording = false;
  recordedTime;
  isRecordingStop: boolean;
  blobUrl;
  userId: string;
  socket;
  recordingData;
  imageUrl: string;
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.imageUrl = environment.rearGuardImageUri;
    this.socket = io(environment.rearGuradSocketBaseUri);
    this.socket.on('new-message-received', (result) => {
      if (result.message === 'Success') {
        this.getChatMessages(this.firstFriend._id);
        this.scrollToBottom();
      }
    });
    this.friendsList = [];
    this.originalFriendsList = [];

    this.isRecordingStop = false;
    this.firstFriend = {};
    this.preview = 'show-Preview-hide';
    this.showloader = 'loaderImage';
    this.chatScreen = 'online-person hideChatScreen';
    this.chatHeader = 'chat-header-hide';
    this.chatMessagesList = [];
    this.userId = this.route.snapshot.params['id'];
    this.userDetails = this.authService.getloggedUserDetails();
    this.getFriendList();
    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.recordingData = data.blob;

      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(data.blob)
      );
    });
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  ngOnInit(): void {
    this.socket.on('new-message-received', (result) => {
      if (result.message === 'Success') {
        this.getChatMessages(this.firstFriend._id);
        this.scrollToBottom();
      }
    });
  }
  public getFriendList() {
    this.friendsList = [];
    this.originalFriendsList = [];

    const searchFriend = new FriendRequest();
    searchFriend.limit = 0;
    searchFriend.skip = 0;
    searchFriend.status = 'Accepted';
    this.dataService.getFriendRequest(searchFriend).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalCount > 0) {
          this.friendsList = result.data.friendList;
          this.originalFriendsList = result.data.friendList;

          const a = this.friendsList.findIndex(
            (img) => img._id === this.userId
          );
          this.firstFriend = this.friendsList[a];
          this.getChatMessages(this.firstFriend._id);
          this.scrollToBottom();
        }
      }
      this.showloader = 'notloaderImage';
      this.chatScreen = 'online-person  showChatScreen';
    });
  }

  public getChatMessages(id: string) {
    // this.chatMessagesList = [];
    const chat = new Chat();
    chat.limit = 0;
    chat.skip = 0;
    chat.receiverId = id;
    this.dataService.getChatMessage(chat).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalCount > 0) {
          this.chatMessagesList = result.data.chatData;
        } else {
          this.chatMessagesList = [];
        }
      }
    });
  }
  public sendMessage() {
    const sendMessage = new SendMessage();
    sendMessage.receiverId = this.firstFriend._id;
    sendMessage.textMessage = this.message;
    this.message = '';
    this.dataService.sendMessage(sendMessage).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.socket.emit('new-message', result);
      } else {
        this.chatMessagesList = [];
      }
    });
  }
  scrollToBottom(): void {
    try {
      this.scroll.nativeElement.scrollTop =
        this.scroll.nativeElement.scrollHeight;
    } catch (err) {}
  }
  loadFriend(data: any): void {
    this.firstFriend = data;
    this.getChatMessages(data._id);
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.uploadedFile = file;
      this.preview = 'show-Preview';
      if (file.type.indexOf('image') > -1) {
        this.format = 'image';
      } else if (file.type.indexOf('video') > -1) {
        this.format = 'video';
      } else if (file.type.indexOf('audio') > -1) {
        this.format = 'audio';
      }
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };

      reader.readAsDataURL(file);
      // this.sendFile(file);
    };
    fileUpload.click();
  }

  sendFile() {
    const chatMedia = new ChatMedia();
    const formData = new FormData();
    if (this.format !== 'recording') {
      formData.append('mediaFile', this.uploadedFile);
    } else {
      formData.append('mediaFile', this.recordingData);
    }
    formData.append('receiverId', this.firstFriend._id);

    if (this.format === 'image') {
      formData.append('isMediaTypeAudio', 'false');
      formData.append('isMediaTypeVideo', 'false');
    }
    if (this.format === 'video') {
      formData.append('isMediaTypeAudio', 'false');
      formData.append('isMediaTypeVideo', 'true');
    }
    if (this.format === 'audio' || this.format === 'recording') {
      formData.append('isMediaTypeAudio', 'true');
      formData.append('isMediaTypeVideo', 'false');
    }

    chatMedia.receiverId = this.firstFriend._id;
    chatMedia.mediaFile = this.uploadedFile;
    this.dataService.sendChatMedia(formData).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.preview = 'show-Preview-hide';
        this.socket.emit('new-message', result);
        this.format = '';
      }
    });
  }

  startRecording() {
    this.preview = 'show-Preview';
    this.format = 'recording';
    this.isRecordingStop = true;
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      this.isRecordingStop = false;
    }
  }
  public searchFriend(str) {
    const a = str.data;
    if (a !== null) {
      const rsult = this.search(a, this.originalFriendsList);
      this.friendsList = rsult;
    } else {
      this.friendsList = this.originalFriendsList;
    }
  }
  search(nameKey, myArray): any {
    const arr = [];
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].fullName.indexOf(nameKey) > -1) {
        arr.push(myArray[i]);
      }
    }
    return arr;
  }
  navigateToAudio() {
    const json = { userid: this.userId, type: 'Audio' };
    this.socket.emit('call-request', json);
    localStorage.setItem('callingUserId', this.userId);
    this.router.navigateByUrl('/audio');
  }
  navigateToVideo() {
    const json = { userid: this.userId, type: 'Video' };
    this.socket.emit('call-request', json);
    localStorage.setItem('callingUserId', this.userId);
    this.router.navigateByUrl('/video');
  }
}
