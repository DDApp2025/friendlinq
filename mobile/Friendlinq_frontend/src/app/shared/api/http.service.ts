import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) {}

  // tslint:disable-next-line:typedef
  get<T>(url: string, header: any) {
    return this.httpClient.get<T>(url, header);
  }
  // tslint:disable-next-line:typedef
  delete<T>(url: string, header: any) {
    return this.httpClient.delete(url, header);
  }
  // tslint:disable-next-line:typedef
  post<T>(url: string, data: any, header: any) {
    return this.httpClient.post(url, data, header);
  }
  // tslint:disable-next-line:typedef
  put<T>(url: string, data: any, header: any) {
    return this.httpClient.put(url, data, header);
  }
}
