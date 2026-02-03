import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ChatService } from 'src/app/shared/services/chat.service';
import { DataService } from '../../public/service/data.service';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CommentComponent } from '../comment/comment.component';
import { ShareComponent } from '../share/share.component';
import { AuthService } from 'src/app/shared/api/auth.service';
import { ReportPost } from '../../models/sharePost.model';
@Component({
  selector: 'app-friend-profile',
  templateUrl: './friend-profile.component.html',
  styleUrls: ['./friend-profile.component.css'],
})
export class FriendProfileComponent implements OnInit {
  userId: string;
  friendsProfile: any;
  public isPicExists: string;
  public isFriend: string;
  public socket;
  myPosts: any;
  imageUrl: string;
  previewClass: string;
  clickIndex: number;
  clickBlurIndex: number;
  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private chatService: ChatService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.clickBlurIndex = -1;
    this.previewClass = 'as';
    this.socket = io(environment.rearGuradSocketBaseUri);
    router.events.subscribe((event: NavigationStart) => {
      if (event instanceof NavigationStart) {
        this.userId = event.url.split('/')[2];
        if (this.userId !== undefined) {
          this.getFriendProfile(this.userId);
        }
      }
      // see also}
    });
    this.userId = this.route.snapshot.params['id'];
    this.getFriendProfile(this.userId);
    this.getFriendPost();
    this.imageUrl = environment.rearGuardImageUri;
  }
  removeBlur(i) {
    this.clickBlurIndex = i;
  }
  toggleClass(className, i) {
    if (className === 'as') {
      this.previewClass = 'ash';
    } else {
      this.previewClass = 'as';
    }
    this.clickIndex = i;
  }

  ngOnInit(): void {}
  getFriendProfile(id: string) {
    this.dataService.getFriendProfile(this.userId).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.isFriend = localStorage.getItem('isFriend');
        this.friendsProfile = result.data.customerData;
        this.isPicExists =
          this.friendsProfile.imageURL.original !== ''
            ? environment.rearGuardImageUri +
              '/' +
              this.friendsProfile.imageURL.original
            : '../../../../../assets/images/banner1.jpg';
      }
    });
  }
  navigateToChat() {
    this.router.navigateByUrl('/chat/' + this.userId);
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
  getFriendPost() {
    this.dataService.getAnotherUsersPost(this.userId).subscribe((result) => {
      if (result && result.message === 'Success') {
        this.myPosts = result.data.myPost.reverse();
      }
    });
  }
  openDialog(postId, item, index, type) {
    this.dataService.getPostComment(postId).subscribe((commentResult: any) => {
      if (commentResult && commentResult.message === 'Success') {
        if (
          commentResult &&
          commentResult.data &&
          commentResult.data.comments
        ) {
          const json = { postDetail: [], commentDetail: [], index: 0 };
          json.postDetail = item;
          json.commentDetail = commentResult.data.comments;
          json.index = index;

          const dialogRef = this.dialog.open(CommentComponent, {
            data: json,
            height: '600px',
            width: '700px',
            autoFocus: false,
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((data) => {
            this.myPosts[index].totalComment = data.count;
          });
        }
      }
    });
  }
  saveComment(comment, i, postId) {
    this.dataService.postComment(postId, comment).subscribe((result: any) => {
      if (result && result.message === 'Success') {
      }
    });
  }
  onKeydown(event) {
    event.preventDefault();
  }
  UpdateLikeUnlikeStatus(id, status, index) {
    let likeStatus: boolean;
    if (status) {
      likeStatus = false;
    } else {
      likeStatus = true;
    }
    this.dataService.postLike(id, likeStatus).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (likeStatus === false) {
          this.myPosts[index].totalLike =
            this.myPosts[index].totalLike === 0
              ? 0
              : this.myPosts[index].totalLike - 1;
        } else {
          this.myPosts[index].totalLike =
            this.myPosts[index].totalLike === 0
              ? 1
              : this.myPosts[index].totalLike + 1;
        }
        this.myPosts[index].isLike = likeStatus;
      }
    });
  }

  openShareDialog(item) {
    const dialogRef = this.dialog.open(ShareComponent, {
      height: '350px',
      width: '700px',
      autoFocus: false,
      disableClose: true,
      panelClass: 'custom',
      data: item,
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.getFriendPost();
    });
  }
  reportPost(id, postType) {
    const reportPost = new ReportPost();
    reportPost.authorization =
      this.authService.getloggedUserDetails().accessToken;
    reportPost.postId = id;
    reportPost.userId = this.userId;
    reportPost.sensitive = true;
    reportPost.admin = false;

    this.dataService.reportPost(reportPost).subscribe((commentResult: any) => {
      this.getFriendPost();
    });
  }
}
