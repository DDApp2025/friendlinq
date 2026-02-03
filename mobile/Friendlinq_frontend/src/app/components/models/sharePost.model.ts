export class SharePost {
  authorization: string;
  imageUrl: string;
  imageThumbnail: string;
  videoUrl: string;
  videoThumbnail: string;
  postTitle: string;
  postContent: string;
  postType: string;
}
export class ReportPost {
  authorization: string;
  postId: string;
  userId: string;
  sensitive: boolean;
  admin: boolean;
}
