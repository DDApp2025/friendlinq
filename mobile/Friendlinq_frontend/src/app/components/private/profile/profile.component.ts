import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { AuthService } from 'src/app/shared/api/auth.service';
import { MessageService } from 'src/app/shared/api/message.service';
import { StaticData } from 'src/app/shared/constants/constant';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Profile } from '../../models/signup.model';
import { DataService } from '../../public/service/data.service';
import { PrivateContainerComponent } from '../container/private-container/private-container.component';
import { environment } from 'src/environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CommentComponent } from '../comment/comment.component';
import { ShareComponent } from '../share/share.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;
  files = [];
  public userDetails: any;
  profileForm = this.initForm();
  public countryList: [];
  public genderList: [];
  public isEdit: boolean;
  public isPicExists: string;
  public myPosts: any;
  imageUrl: string;
  previewClass: string;
  clickIndex: number;
  clickBlurIndex: number;
  constructor(
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    private fb: FormBuilder,
    private notifyService: NotificationService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
    this.previewClass = 'as';
    this.countryList = StaticData.countries;
    this.genderList = StaticData.Gender;
    this.isEdit = false;
    this.getMyPost();
    this.imageUrl = environment.rearGuardImageUri;
    this.clickBlurIndex = -1;
  }

  ngOnInit(): void {
    this.userDetails = this.authService.getloggedUserDetails();
    if (this.userDetails && this.userDetails.accessToken) {
      this.isPicExists =
        this.userDetails.imageURL.original !== ''
          ? 'https://rearguardsocial.devdevelopment.net/' +
            this.userDetails.imageURL.original
          : '../../../../../assets/images/banner1.jpg';
    } else {
      this.router.navigateByUrl('/login');
    }
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
  navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.sendFile(file);
    };
    fileUpload.click();
  }

  sendFile(file) {
    const formData = new FormData();
    formData.append('document', file);
    this.dataService.uploadProfilePic(formData).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.notifyService.showSuccess('Image Upload Succesfully', '');
        sessionStorage.setItem('loggedInUser', JSON.stringify(result.data));
        this.messageService.sendMessage(true);
        this.bindDetails();
      } else {
        this.notifyService.showWarning(result.message, '');
      }
    });
  }
  editProfile() {
    this.isEdit = true;
    this.profileForm = this.fb.group({
      fullName: [this.userDetails.fullName],
      country: [this.userDetails.country],
      gender: [this.userDetails.gender],
      state: [this.userDetails.state],
      city: [this.userDetails.city],
      email: [this.userDetails.email],
      phoneNumber: [this.userDetails.phoneNumber],
    });
  }
  resetForm() {
    this.isEdit = false;
  }
  updateProfile() {
    const profile = new Profile();
    profile.fullName = this.profileForm.value.fullName;
    profile.about = '';
    profile.city = this.profileForm.value.city;
    profile.state = this.profileForm.value.state;
    profile.country = this.profileForm.value.country;
    profile.gender = this.profileForm.value.gender;
    profile.phoneNumber = this.profileForm.value.phoneNumber;
    this.dataService.saveProfileDate(profile).subscribe((result) => {
      if (result && result.message === 'Success') {
        this.notifyService.showSuccess('Success', '');
        sessionStorage.setItem(
          'loggedInUser',
          JSON.stringify(result.data.customerData)
        );
        this.isEdit = false;
        this.bindDetails();
        this.messageService.sendMessage(true);
      } else {
        this.notifyService.showWarning(result.message, '');
      }
    });
  }
  getMyPost() {
    this.dataService.getMyPost().subscribe((result) => {
      if (result && result.message === 'Success') {
        this.myPosts = result.data.myPost;
      }
    });
  }
  private initForm() {
    return this.fb.group({
      fullName: ['', Validators.required],
      country: ['', Validators.required],
      gender: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.maxLength(10)]],
    });
  }
  private bindDetails() {
    this.userDetails = this.authService.getloggedUserDetails();
    this.isPicExists =
      this.userDetails.imageURL.original !== ''
        ? 'https://rearguardsocial.devdevelopment.net/' +
          this.userDetails.imageURL.original
        : '../../../../../assets/images/banner1.jpg';
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
      this.getMyPost();
    });
  }

  deletePost(id, index) {
    this.dataService.deletePost(id).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.myPosts.splice(index, 1);
      }
    });
  }
}
