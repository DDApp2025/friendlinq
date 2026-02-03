import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { AppComponent } from 'src/app/app.component';
import { SearchFriend } from 'src/app/components/models/friend.model';
import { DataService } from 'src/app/components/public/service/data.service';
import { AuthService } from 'src/app/shared/api/auth.service';
import { MessageService } from 'src/app/shared/api/message.service';
import { ChatService } from 'src/app/shared/services/chat.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-private-container',
  templateUrl: './private-container.component.html',
  styleUrls: ['./private-container.component.css'],
})
export class PrivateContainerComponent implements OnInit {
  public userDetails: any;
  subscription: Subscription;
  public dropDownNavMenu: string;
  public dropDownNavMenuChild: string;
  public isPicExists: string;
  searchMasterForm = this.initForm();
  public isSearchTabVisible: string;
  public isSearchResultVisible: string;
  public isdashboardVisible: string;
  public showloader: string;
  public showResponseClass: string;
  public imageURl: string;

  public searchFriendList: [];
  public showCallButton: boolean;
  public type: string;
  public socket;

  // tslint:disable-next-line:member-ordering
  public static returned: Subject<any> = new Subject();
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private dataService: DataService,
    private notifyService: NotificationService,
    private fb: FormBuilder,
    private chatService: ChatService
  ) {
    this.imageURl = environment.rearGuardImageUri;
    this.socket = io(environment.rearGuradSocketBaseUri);
    this.showCallButton = false;
    this.socket.on('call-request-received', (result) => {
      this.userDetails = this.authService.getloggedUserDetails();
      if (result.userid === this.userDetails._id) {
        this.type = result.type;
        this.showCallButton = true;
        this.notifyService.showInfo(
          'Someone is calling you.Please Pick the Call.',
          ''
        );
      }
    });
    this.dropDownNavMenu = 'nav-item dropdown';
    this.dropDownNavMenuChild = 'dropdown-menu profile-dropdown';
    this.isSearchTabVisible = 'main-body';
    this.isdashboardVisible = 'dashboard';
    this.isSearchResultVisible = 'main-body-None';
    this.showloader = 'notloaderImage';
    this.showResponseClass = 'emptyResponseHide';

    this.subscription = this.messageService
      .getMessage()
      .subscribe((message: boolean) => {
        if (message) {
          this.userDetails = this.authService.getloggedUserDetails();
          this.isPicExists =
            this.userDetails.imageURL.original !== ''
              ? 'https://rearguardsocial.devdevelopment.net/' +
                this.userDetails.imageURL.original
              : '../../../../../assets/images/user.jfif';
        } else {
          // clear messages when empty message received
        }
      });
  }
  private initForm() {
    return this.fb.group({
      searchValue: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userDetails = this.authService.getloggedUserDetails();
    if (this.userDetails && this.userDetails.accessToken) {
      this.isPicExists =
        this.userDetails.imageURL.original !== ''
          ? 'https://rearguardsocial.devdevelopment.net/' +
            this.userDetails.imageURL.original
          : '../../../../../assets/images/user.jfif';
    } else {
      this.router.navigateByUrl('/login');
    }
  }
  navigateToProfile() {
    this.isSearchTabVisible = 'main-body';
    this.isdashboardVisible = 'dashboard';
    this.isSearchResultVisible = 'main-body-None';
    this.router.navigateByUrl('/profile');
  }
  showNavMenu() {
    if (this.dropDownNavMenu.indexOf('show') >= 0) {
      this.dropDownNavMenu = 'nav-item dropdown';
      this.dropDownNavMenuChild = 'dropdown-menu profile-dropdown';
    } else {
      this.dropDownNavMenu = 'nav-item dropdown show';
      this.dropDownNavMenuChild = 'dropdown-menu profile-dropdown show';
    }
  }
  logout() {
    this.dataService.logout().subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.notifyService.showSuccess('LogOut Successfully', '');
        sessionStorage.clear();
        this.router.navigateByUrl('/login');
      }
    });
  }
  public searchFriend() {
    const searchValue = this.searchMasterForm.value.searchValue;
    const searchFriend = new SearchFriend();
    this.searchFriendList = [];
    searchFriend.limit = 0;
    searchFriend.skip = 0;
    searchFriend.searchText = searchValue;
    this.showloader = 'loaderImage';
    this.showResponseClass = 'emptyResponseHide';
    if (searchValue !== '') {
      this.isSearchTabVisible = 'main-body-None';
      this.isdashboardVisible = 'dashboard-none';
      this.isSearchResultVisible = 'main-body-Search';
      this.dataService.searchFriend(searchFriend).subscribe((result: any) => {
        if (result && result.message === 'Success') {
          if (result.data.totalCount > 0) {
            this.searchFriendList = result.data.customerData;
          } else {
            this.showResponseClass = 'emptyResponseShow';
            this.searchFriendList = [];
            this.notifyService.showWarning('No Records Found.', '');
          }
        } else {
          this.notifyService.showWarning(result.message, '');
        }
        this.showloader = 'notloaderImage';
      });
    } else {
      this.isSearchTabVisible = 'main-body';
      this.isdashboardVisible = 'dashboard';
      this.isSearchResultVisible = 'main-body-None';
      this.showloader = 'notloaderImage';
    }
  }
  public AddFriend(data: any) {
    const friendRequest = {
      userToId: data._id,
    };
    this.dataService
      .sendFriendRequest(friendRequest)
      .subscribe((result: any) => {
        if (result && result.message === 'Success') {
          this.notifyService.showSuccess('Friend Request Sent.', '');
        } else {
          this.notifyService.showWarning(result.message, '');
        }
      });
  }
  public redirectToDashboard() {
    this.isSearchTabVisible = 'main-body';
    this.isdashboardVisible = 'dashboard';
    this.isSearchResultVisible = 'main-body-None';
    this.router.navigateByUrl('/dashboard');
  }
  public redirectToFriend() {
    this.isSearchTabVisible = 'main-body';
    this.isdashboardVisible = 'dashboard';
    this.isSearchResultVisible = 'main-body-None';
    this.router.navigateByUrl('/friend');
  }
  public openFriendProfile(data: any, isFriend: string) {
    this.isSearchTabVisible = 'main-body';
    this.isdashboardVisible = 'dashboard';
    this.isSearchResultVisible = 'main-body-None';
    this.showloader = 'notloaderImage';
    localStorage.setItem('isFriend', isFriend);
    this.router.navigateByUrl('/profile/' + data._id);
  }
  Acceptcall() {
    this.showCallButton = false;
    localStorage.removeItem('callingUserId');
    if (this.type === 'Audio') {
      this.router.navigateByUrl('/audio');
    } else {
      this.router.navigateByUrl('/video');
    }
  }
  DeclineCall() {
    //this.showCallButton = false;
    localStorage.removeItem('callingUserId');
    //this.socket.emit('call-decline', this.userDetails._id);
  }
}
