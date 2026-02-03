import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  public Logout() {
    //
  }
  getloggedUserDetails(): any {
    const loggedInUserDetails = JSON.parse(
      sessionStorage.getItem('loggedInUser')
    );
    if (loggedInUserDetails && loggedInUserDetails.accessToken) {
      return loggedInUserDetails;
    }
  }
}
