export class Chat {
  authorization: string;
  receiverId: string;
  skip: number;
  limit: number;
}

export class SendMessage {
  receiverId: string;
  textMessage: string;
}
export class ChatMedia {
  receiverId: string;
  isMediaTypeVideo: boolean;
  isMediaTypeAudio: boolean;
  videoThumbnail: any;
  mediaFile: any;
}
