import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/api/auth.service';
import { DataService } from '../../public/service/data.service';
import { environment } from 'src/environments/environment';
import { PostMedia } from '../../models/post.model';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CommentComponent } from '../comment/comment.component';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
import { ShareComponent } from '../share/share.component';
import { ReportPost } from '../../models/sharePost.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;
  @ViewChild('myPublicElement', { static: true }) MyPublicElement: ElementRef;
  @ViewChild('myFriendElement', { static: true }) MyFriendElement: ElementRef;

  public userDetails: any;
  public friendPostList: any;
  public publicPostList: any;
  public isFriendPost: boolean;
  imageSrc: string;
  format: string;
  preview: string;
  uploadedFile: any;
  imageUrl: string;
  postContent: string;
  showLoader: boolean;
  previewClass: string;
  genderForm = this.initForm();
  clickIndex: number;
  clickBlurIndex: number;
  constructor(
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.friendPostList = [];
    this.publicPostList = [];
    this.isFriendPost = true;
    this.previewClass = 'as';
    this.clickBlurIndex = -1;
    this.imageUrl = environment.rearGuardImageUri;
    this.userDetails = this.authService.getloggedUserDetails();
    if (this.userDetails && this.userDetails.accessToken) {
      this.getFriendsPost();
    }
  }
  private initForm() {
    return this.fb.group({
      postContent: ['', Validators.required],
      postType: ['', Validators.required],
    });
  }

  toggleClass(className, i) {
    if (className === 'as') {
      this.previewClass = 'ash';
    } else {
      this.previewClass = 'as';
    }
    this.clickIndex = i;
  }

  removeBlur(i) {
    this.clickBlurIndex = i;
  }
  ngOnInit(): void {}
  navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }
  getFriendsPost() {
    this.publicPostList = [];
    this.showLoader = true;
    this.isFriendPost = true;
    this.dataService.getFriendPost().subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalMyPost > 0) {
          this.friendPostList = result.data.myPost;
          this.showLoader = false;
        } else {
          this.showLoader = false;
        }
      }
    });
  }
  getPublicPost() {
    this.friendPostList = [];
    this.isFriendPost = false;
    this.showLoader = true;
    this.dataService.getPublicPost().subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalMyPost > 0) {
          this.publicPostList = result.data.myPost;
          this.showLoader = false;
        }
      }
    });
  }
  onKeydown(event) {
    event.preventDefault();
  }
  saveComment(comment, i, postType, postId) {
    this.dataService.postComment(postId, comment).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (postType === 'Friend') {
          const res = result.data.comment;
          const json = { email: '', fullName: '', _id: '', imageURL: {} };
          json.email = this.userDetails.email;
          json.fullName = this.userDetails.fullName;
          json._id = this.userDetails._id;
          json.imageURL = this.userDetails.imageURL;
          res.commentAuthor = json;
          this.friendPostList[i].comment.push(result.data.comment);
          this.friendPostList[i].totalComment =
            this.friendPostList[i].totalComment + 1;
          this.MyFriendElement.nativeElement.value = '';
        }
        // if (postType === 'Public') {
        //   const res = result.data.comment;
        //   const json = { email: '', fullName: '', _id: '', imageURL: {} };
        //   json.email = this.userDetails.email;
        //   json.fullName = this.userDetails.fullName;
        //   json._id = this.userDetails._id;
        //   json.imageURL = this.userDetails.imageURL;
        //   res.commentAuthor = json;
        //   this.publicPostList[i].comment.push(result.data.comment);
        //   this.publicPostList[i].totalComment =
        //     this.publicPostList[i].totalComment + 1;
        //   this.MyPublicElement.nativeElement.value = '';
        // }
      }
    });
  }
  UpdateLikeUnlikeStatus(id, status, index, type) {
    let likeStatus: boolean;
    if (status) {
      likeStatus = false;
    } else {
      likeStatus = true;
    }
    this.dataService.postLike(id, likeStatus).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (type === 'Friend') {
          if (likeStatus === false) {
            this.friendPostList[index].totalLike =
              this.friendPostList[index].totalLike === 0
                ? 0
                : this.friendPostList[index].totalLike - 1;
          } else {
            this.friendPostList[index].totalLike =
              this.friendPostList[index].totalLike === 0
                ? 1
                : this.friendPostList[index].totalLike + 1;
          }
          this.friendPostList[index].isLike = likeStatus;
        }
        if (type === 'Public') {
          if (likeStatus === false) {
            this.publicPostList[index].totalLike =
              this.publicPostList[index].totalLike === 0
                ? 0
                : this.publicPostList[index].totalLike - 1;
          } else {
            this.publicPostList[index].totalLike =
              this.publicPostList[index].totalLike === 0
                ? 1
                : this.publicPostList[index].totalLike + 1;
          }
          this.publicPostList[index].isLike = likeStatus;
        }
      }
    });
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.uploadedFile = file;

      if (file.type.indexOf('image') > -1) {
        this.format = 'image';
      } else if (file.type.indexOf('video') > -1) {
        this.format = 'video';
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

  CreatePost() {
    if (this.genderForm.invalid) {
      return;
    }
    const formData = new FormData();
    debugger;
    formData.append('postTitle', this.genderForm.value.postContent);
    formData.append('postContent', this.genderForm.value.postContent);
    formData.append('postType', this.genderForm.value.postType);
    if (this.format !== 'image' && this.format !== 'video') {
      formData.append('isMediaFileUploaded', 'false');
      formData.append('isMediaTypeVideo', 'false');
    }
    if (this.format === 'image') {
      formData.append('isMediaFileUploaded', 'true');
      formData.append('isMediaTypeVideo', 'false');
      formData.append('mediaFile', this.uploadedFile);
    }
    if (this.format === 'video') {
      formData.append('isMediaFileUploaded', 'true');
      formData.append('isMediaTypeVideo', 'true');
      formData.append('mediaFile', this.uploadedFile);
    }

    this.dataService.createPost(formData).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.initForm();
        this.format = '';

        this.getFriendsPost();
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
            console.log('Dialog output:', data);
            if (type === 'Friend') {
              this.friendPostList[index].totalComment = data.count;
              this.friendPostList[index].comment = data.comment;
            }
            if (type === 'Public') {
              this.publicPostList[index].totalComment = data.count;
              this.publicPostList[index].comment = data.comment;
            }
          });
        }
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
      if (res === 'Friend_Only') {
        this.getFriendsPost();
      } else {
        this.getPublicPost();
      }
    });
  }
  reportPost(id, postType) {
    const reportPost = new ReportPost();
    reportPost.authorization = this.userDetails.accessToken;
    reportPost.postId = id;
    reportPost.userId = this.userDetails._id;
    reportPost.sensitive = true;
    reportPost.admin = false;

    this.dataService.reportPost(reportPost).subscribe((commentResult: any) => {
      if (postType === 'Friend') {
        this.getFriendsPost();
      } else {
        this.getPublicPost();
      }
    });
  }
}
