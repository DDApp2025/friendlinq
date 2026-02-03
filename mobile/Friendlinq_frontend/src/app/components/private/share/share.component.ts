import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/api/auth.service';
import { environment } from 'src/environments/environment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DataService } from '../../public/service/data.service';
import { SharePost } from '../../models/sharePost.model';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css'],
})
export class ShareComponent implements OnInit {
  imageUrl: string;
  userDetails: any;
  postDetail: any;
  postComment: any;
  genderForm = this.initForm();
  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<ShareComponent>,
    private dataService: DataService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.imageUrl = environment.rearGuardImageUri;
    this.userDetails = this.authService.getloggedUserDetails();
    this.postDetail = data;
    this.postComment = data.postContent;
  }
  private initForm() {
    return this.fb.group({
      postType: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }
  sharePost(data) {
    const _sharePost = new SharePost();
    _sharePost.authorization = this.userDetails.accessToken;
    _sharePost.imageThumbnail = data.imageURL.original;
    _sharePost.imageUrl = data.imageURL.original;
    _sharePost.videoUrl = data.videoURL;
    _sharePost.videoThumbnail = data.videoURL;
    _sharePost.postContent = this.postComment;
    _sharePost.postTitle = this.postComment;
    _sharePost.postType = this.genderForm.value.postType;
    this.dataService.sharePost(_sharePost).subscribe((result: any) => {
      this.dialogRef.close(this.genderForm.value.postType);
    });
  }
}
