import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Using /api so the proxy.conf.json can catch and redirect the call
  public baseUrl = '/api'; 
  
  constructor(private http: HttpClient, private router: Router) { }
  
  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }
  
  login(loginData: any): Observable<any> {
    const loginUrl = `${this.baseUrl}/v1/user/login`; 
    return this.http.post(loginUrl, loginData, this.getHeaders());
  }
  
  signup(data: any): Observable<any> {
    const signupUrl = `${this.baseUrl}/v1/user/registration`;
    return this.http.post(signupUrl, data, this.getHeaders());
  }
  
  logout(): Observable<any> {
    sessionStorage.clear();
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
    return of({ success: true });
  }
  
  forgotPassword(email: string): Observable<any> {
    const forgotUrl = `${this.baseUrl}/v1/user/forgotPassword`;
    return this.http.post(forgotUrl, { email }, this.getHeaders());
  }
  
  // Mandatory stubs for component stability
  searchFriend(data: any): Observable<any> { return of([]); }
  sendFriendRequest(data: any): Observable<any> { return of({}); }
  getFriendRequest(data: any): Observable<any> { return of([]); }
  friendSuggestions(): Observable<any> { return of([]); }
  acceptFriendRequest(id: any): Observable<any> { return of({}); }
  getChatMessage(data: any): Observable<any> { return of([]); }
  sendMessage(data: any): Observable<any> { return of({}); }
  sendChatMedia(data: any): Observable<any> { return of({}); }
  postComment(id: any, comment: any): Observable<any> { return of({}); }
  deleteComment(id: any): Observable<any> { return of({}); }
  postLike(id: any, status: any): Observable<any> { return of({}); }
  createPost(data: any): Observable<any> { return of({}); }
  getPostComment(id: any): Observable<any> { return of([]); }
  reportPost(data: any): Observable<any> { return of({}); }
  getFriendPost(): Observable<any> { return of([]); }
  getPublicPost(): Observable<any> { return of([]); }
  getFriendProfile(id: any): Observable<any> { return of({}); }
  getAnotherUsersPost(id: any): Observable<any> { return of([]); }
  uploadProfilePic(data: any): Observable<any> { return of({}); }
  saveProfileDate(data: any): Observable<any> { return of({}); }
  getMyPost(): Observable<any> { return of([]); }
  deletePost(id: any): Observable<any> { return of({}); }
  sharePost(data: any): Observable<any> { return of({}); }
  MakeUserFriendWithAdmin(token: any): Observable<any> { return of({}); }
}