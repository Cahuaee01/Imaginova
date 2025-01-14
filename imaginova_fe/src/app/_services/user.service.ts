import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangePasswordResponse } from "../_items/ChangePassword"
import { LoginResponse } from '../_items/LoginResponse';
import { BehaviorSubject, of } from 'rxjs';
import { config } from '../config/config';
import { ProfileResponse } from '../_items/ProfileResponse';

@Injectable({
  providedIn: 'root'
})

export class  UserService {
  url = config.apiUrl;
  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  signup(UserItem: { usr: string, email: string, pwd1: string, pwd2: string }) {
    const url = `${this.url}/sign-up`; 
    return this.http.post(url, UserItem, this.httpOptions); 
  }

  reset(email: string) {
    const url = `${this.url}/password-reset`;
    return this.http.post(url, { email }, this.httpOptions);
  }

  verifyOtp(otp: string) {
    const url = `${this.url}/verify-otp`;
    return this.http.post<ChangePasswordResponse>(url, { otp }, this.httpOptions);
  }

  changePassword(email: string, password: string, otp: string) {
    const url = `${this.url}/insert-new-password`;
    return this.http.post(url, { email, password, otp }, this.httpOptions);
  }

  login(email: string, password: string) {
    const url = `${this.url}/login`;
    return this.http.post<LoginResponse>(url, { email, password }, this.httpOptions);
  }

  verifyJWT(token: string){
    return this.http.post(`${this.url}/verify-JWT`, { token }, this.httpOptions);
  }

  getProfile(user_id: number){
    const url = `${this.url}/profile/${user_id}`;
    return this.http.get<ProfileResponse>(url); 
  }

  //login e logout
  private isLoggedSubject = new BehaviorSubject<boolean>(this.checkInitialLoginState());
  isLogged$ = this.isLoggedSubject.asObservable();

  private checkInitialLoginState(): boolean {
    return !!sessionStorage.getItem('authToken'); 
  }

  saveTokenAndUserId(token: string, user_id: number): void {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user_id', user_id.toString()); 
    this.isLoggedSubject.next(true); 
  }

  getToken() {
    return sessionStorage.getItem('authToken');
  }

  getUser(){
    return sessionStorage.getItem('user_id');
  }

  logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user_id');
    this.isLoggedSubject.next(false); 
    return of(null);
  }
  
}
