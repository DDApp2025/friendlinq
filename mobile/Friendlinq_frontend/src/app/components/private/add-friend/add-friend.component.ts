import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { FriendRequest, SearchFriend } from '../../models/friend.model';
import { DataService } from '../../public/service/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.css'],
})
export class AddFriendComponent implements OnInit {
  public isSearchEnable: boolean;
  public statusClass: string;
  public searchFriendList: [];
  public invitationList: [];
  public friendsList: [];
  public sentRequestList: [];
  public friendSuggestionList: [];
  public imageUrl: string;
  public isRequestTabVisible: string;
  public isMyFriendTabVisible: string;
  public isSentRequestTabVisible: string;
  public isSearchTabVisible: string;
  public isInvitationTabVisible: string;
  public showloader: string;
  public showResponseClass: string;

  public hideNavPill: string;

  searchFriendForm = this.initForm();
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private notifyService: NotificationService,
    private router: Router
  ) {
    this.isSearchEnable = true;
    this.statusClass = 'search-Friends-not';
    this.isRequestTabVisible = 'tab-pane fade in active show';
    this.isMyFriendTabVisible = 'tab-pane fade';
    this.isSentRequestTabVisible = 'tab-pane fade';
    this.isSearchTabVisible = 'tab-pane fade';
    this.isInvitationTabVisible = 'tab-pane fade';
    this.hideNavPill = 'nav nav-pills';
    this.showloader = 'notloaderImage';
    this.showResponseClass = 'emptyResponseHide';
    this.imageUrl = environment.rearGuardImageUri;
  }

  ngOnInit(): void {
    this.getFriendSuggestions();
  }
  showSearchBox() {
    this.isSearchEnable = false;
    this.statusClass = 'search-Friends';
  }
  hideSearchBox() {
    this.statusClass = 'search-Friends-not';
    this.isSearchEnable = true;
    this.isRequestTabVisible = 'tab-pane fade in active show';
    this.isMyFriendTabVisible = 'tab-pane fade';
    this.isSentRequestTabVisible = 'tab-pane fade';
    this.isSearchTabVisible = 'tab-pane fade';
    this.searchFriendList = [];
    this.hideNavPill = 'nav nav-pills';
    this.getFriendSuggestions();
    return this.fb.group({
      searchValue: [''],
    });
  }
  private initForm() {
    return this.fb.group({
      searchValue: ['', Validators.required],
    });
  }
  public searchFriend() {
    this.searchFriendList = [];
    this.showResponseClass = 'emptyResponseHide';
    this.isRequestTabVisible = 'tab-pane fade';
    this.isMyFriendTabVisible = 'tab-pane fade';
    this.isSentRequestTabVisible = 'tab-pane fade';
    this.hideNavPill = 'nav nav-pills hide-nav';
    this.isInvitationTabVisible = 'tab-pane fade';
    const searchValue = this.searchFriendForm.value.searchValue;
    const searchFriend = new SearchFriend();
    searchFriend.limit = 0;
    searchFriend.skip = 0;
    searchFriend.searchText = searchValue;
    this.showloader = 'loaderImage';
    this.isSearchTabVisible = 'tab-pane fade in active show';
    if (searchValue !== '') {
      this.dataService.searchFriend(searchFriend).subscribe((result: any) => {
        if (result && result.message === 'Success') {
          if (result.data.totalCount > 0) {
            this.searchFriendList = result.data.customerData;
          } else {
            this.showResponseClass = 'emptyResponseShow';
            this.notifyService.showWarning('No Records Found.', '');
          }
        } else {
          this.notifyService.showWarning(result.message, '');
        }
        this.showloader = 'notloaderImage';
      });
    } else {
      this.showloader = 'notloaderImage';
      this.hideSearchBox();
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

  public showRequestTab() {
    this.isRequestTabVisible = 'tab-pane fade';
    this.isMyFriendTabVisible = 'tab-pane fade';
    this.isSentRequestTabVisible = 'tab-pane fade';
    this.isSearchTabVisible = 'tab-pane fade';
    this.isInvitationTabVisible = 'tab-pane fade in active show';
    this.showResponseClass = 'emptyResponseHide';
    this.getInvitationRequests();
  }
  public showMyFriendTab() {
    this.isRequestTabVisible = 'tab-pane fade';
    this.isMyFriendTabVisible = 'tab-pane fade in active show';
    this.isSentRequestTabVisible = 'tab-pane fade';
    this.isSearchTabVisible = 'tab-pane fade';
    this.isInvitationTabVisible = 'tab-pane fade';
    this.showResponseClass = 'emptyResponseHide';
    this.getFriendList();
  }
  public showSentRequestTab() {
    this.isRequestTabVisible = 'tab-pane fade';
    this.isMyFriendTabVisible = 'tab-pane fade';
    this.isSentRequestTabVisible = 'tab-pane fade in active show';
    this.isSearchTabVisible = 'tab-pane fade';
    this.isInvitationTabVisible = 'tab-pane fade';
    this.showResponseClass = 'emptyResponseHide';
    this.getSendRequests();
  }

  public getInvitationRequests() {
    this.invitationList = [];
    const searchFriend = new FriendRequest();
    searchFriend.limit = 0;
    searchFriend.skip = 0;
    searchFriend.status = 'Invitation';
    this.showloader = 'loaderImage';
    this.dataService.getFriendRequest(searchFriend).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalCount > 0) {
          this.invitationList = result.data.friendList;
        } else {
          this.showResponseClass = 'emptyResponseShow';
          this.notifyService.showWarning('No Records Found.', '');
        }
      } else {
        this.notifyService.showWarning(result.message, '');
      }
      this.showloader = 'notloaderImage';
    });
  }
  public getFriendList() {
    this.friendsList = [];
    const searchFriend = new FriendRequest();
    searchFriend.limit = 0;
    searchFriend.skip = 0;
    searchFriend.status = 'Accepted';
    this.showloader = 'loaderImage';
    this.dataService.getFriendRequest(searchFriend).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalCount > 0) {
          this.friendsList = result.data.friendList;
        } else {
          this.showResponseClass = 'emptyResponseShow';
          this.notifyService.showWarning('No Records Found.', '');
        }
      } else {
        this.notifyService.showWarning(result.message, '');
      }
      this.showloader = 'notloaderImage';
    });
  }
  public getSendRequests() {
    this.sentRequestList = [];
    const searchFriend = new FriendRequest();
    searchFriend.limit = 0;
    searchFriend.skip = 0;
    searchFriend.status = 'Send';
    this.showloader = 'loaderImage';
    this.dataService.getFriendRequest(searchFriend).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        if (result.data.totalCount > 0) {
          this.sentRequestList = result.data.friendList;
        } else {
          this.showResponseClass = 'emptyResponseShow';
          this.notifyService.showWarning('No Records Found.', '');
        }
      } else {
        this.notifyService.showWarning(result.message, '');
      }
      this.showloader = 'notloaderImage';
    });
  }
  public getFriendSuggestions() {
    this.friendSuggestionList = [];
    this.showloader = 'loaderImage';
    this.dataService.friendSuggestions().subscribe((result: any) => {
      if (result && result.length > 0) {
        this.friendSuggestionList = result;
      } else {
        this.showResponseClass = 'emptyResponseShow';
        this.notifyService.showWarning('No Friend Suggestion Available.', '');
      }
      this.showloader = 'notloaderImage';
    });
  }
  public AcceptRequest(data: any) {
    this.showloader = 'loaderImage';
    this.dataService.acceptFriendRequest(data._id).subscribe((result: any) => {
      if (result && result.message === 'Success') {
        this.notifyService.showSuccess('Friend Request Accepted.', '');
        this.getInvitationRequests();
      } else {
        this.notifyService.showWarning('No Friend Suggestion Available.', '');
      }
    });
  }
  public openFriendProfile(data: any, isFriend: string) {
    localStorage.setItem('isFriend', isFriend);
    this.router.navigateByUrl('/profile/' + data._id);
  }
}
