import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StaticData } from 'src/app/shared/constants/constant';
import { SignUp } from '../../models/signup.model';
import { Guid } from 'guid-typescript';
import { DataService } from '../service/data.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  signupForm = this.initForm();
  public passwordNotMatch: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private notifyService: NotificationService,
    private router: Router
  ) {}
  
  private initForm() {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmpassword: ['', Validators.required],
    });
  }
  
  signup() {
    if (this.signupForm.invalid) {
      return;
    }
    if (
      this.signupForm.value.password !== this.signupForm.value.confirmpassword
    ) {
      this.passwordNotMatch = true;
      return;
    }
    this.passwordNotMatch = false;
    const signupWrapper = new SignUp();
    signupWrapper.fullName = this.signupForm.value.name;
    signupWrapper.email = this.signupForm.value.email;
    signupWrapper.age = 0;
    signupWrapper.country = 'US';
    signupWrapper.deviceToken = Guid.create().toString();
    signupWrapper.deviceType = StaticData.DeviceType;
    signupWrapper.gender = '';
    signupWrapper.password = this.signupForm.value.password;
    this.dataservice.signup(signupWrapper).subscribe(
      (result) => {
        if (result && result.message === 'Success') {
          this.notifyService.showSuccess(
            'You have successfully registered with FriendLinq',
            'Congratulations!'
          );
          this.dataservice
            .MakeUserFriendWithAdmin(result.data.customerData.accessToken)
            .subscribe((res) => {
              console.log('result', res);
            });
          this.router.navigateByUrl('/login');
        } else {
          alert(result.message || 'Registration failed. Please try again.');
        }
      },
      (error) => {
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    );
  }
}