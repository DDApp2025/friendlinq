import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/api/auth.service';
import { environment } from 'src/environments/environment';
import { DataService } from '../../public/service/data.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit {
  imageUrl: string;
  postDetail: any;
  commentDetail: any;
  userDetails: any;
  comment: string;
  index: number;
  clickBlurIndex: number;
  constructor(
    private dialogRef: MatDialogRef<CommentComponent>,
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.imageUrl = environment.rearGuardImageUri;
    this.postDetail = data.postDetail;
    this.commentDetail = data.commentDetail;
    this.index = data.index;
    this.clickBlurIndex = -1;
    this.userDetails = this.authService.getloggedUserDetails();
  }

  ngOnInit(): void {}
  onKeydown(event) {
    event.preventDefault();
  }
  removeBlur() {
    this.clickBlurIndex = 0;
  }
  saveComment(comment) {
    this.dataService
      .postComment(this.postDetail._id, comment)
      .subscribe((result: any) => {
        if (result && result.message === 'Success') {
          const res = result.data.comment;
          const json = { email: '', fullName: '', _id: '', imageURL: {} };
          json.email = this.userDetails.email;
          json.fullName = this.userDetails.fullName;
          json._id = this.userDetails._id;
          json.imageURL = this.userDetails.imageURL;
          res.commentAuthor = json;
          this.commentDetail.push(result.data.comment);
          this.comment = '';
        }
      });
  }
  closeComment() {
    const json = {};
    json['comment'] =
      this.commentDetail.length > 3
        ? this.commentDetail
            .slice(Math.max(this.commentDetail.length - 2, 1))
            .reverse()
        : this.commentDetail.reverse();
    json['index'] = this.index;
    json['count'] = this.commentDetail.length;

    this.dialogRef.close(json);
  }
  deleteComment(id, index) {
    this.dataService.deleteComment(id).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.commentDetail.splice(index, 1);
      }
    });
  }
  UpdateLikeUnlikeStatus(id, status) {
    let likeStatus: boolean;
    if (status) {
      likeStatus = false;
    } else {
      likeStatus = true;
    }
    this.dataService.postLike(id, likeStatus).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (likeStatus === false) {
          this.postDetail.totalLike =
            this.postDetail.totalLike === 0 ? 0 : this.postDetail.totalLike - 1;
        } else {
          this.postDetail.totalLike =
            this.postDetail.totalLike === 0 ? 1 : this.postDetail.totalLike + 1;
        }
        this.postDetail.isLike = likeStatus;
      }
    });
  }
}
