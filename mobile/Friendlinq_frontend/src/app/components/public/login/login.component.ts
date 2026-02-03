import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../service/data.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginData = {
    email: '',
    password: ''
  };

  passwordVisible: boolean = false;
  rememberMe: boolean = false;

  constructor(
    private router: Router, 
    private dataService: DataService 
  ) { }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginData.email = savedEmail;
      this.rememberMe = true;
    }
  }

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  onLogin() {
    if (this.loginData.email && this.loginData.password) {
      if (this.rememberMe) {
        localStorage.setItem('rememberedEmail', this.loginData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const loginWrapper = {
        email: this.loginData.email,
        password: this.loginData.password,
        deviceType: 'ANDROID', 
        deviceToken: this.generateGuid(), 
        latitude: 5,
        longitude: 5
      };

      this.dataService.login(loginWrapper).subscribe({
        next: (result: any) => {
          if (result && result.message === 'Success') {
            sessionStorage.setItem(
              'loggedInUser',
              JSON.stringify(result.data.customerData)
            );
            this.router.navigate(['/dashboard']); 
          } else {
            alert(result.message || 'Login failed.');
          }
        },
        error: (err: any) => {
          console.error('Proxy Error Trace:', err);
          alert('Check the browser console (F12) to see if the proxy is hitting the wrong URL.');
        }
      });
    } else {
      alert('Email and Password are required.');
    }
  }

  onSignUp() { this.router.navigate(['/signup']); }
  forgotPassword() { this.router.navigate(['/forgot-password']); }
}