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
  public countryList: [];
  public genderList: [];
  public passwordNotMatch: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private notifyService: NotificationService,
    private router: Router
  ) {
    this.countryList = StaticData.countries;
    this.genderList = StaticData.Gender;
  }

  // tslint:disable-next-line:typedef
  private initForm() {
    return this.fb.group({
      name: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', Validators.required],
      confirmpassword: ['', Validators.required],
      email: ['', Validators.required],
    });
  }

  // tslint:disable-next-line:typedef
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
    const signupWrapper = new SignUp();
    signupWrapper.fullName = this.signupForm.value.name;
    signupWrapper.email = this.signupForm.value.email;
    signupWrapper.age = 0;
    signupWrapper.country = this.signupForm.value.country;
    signupWrapper.deviceToken = Guid.create().toString();
    signupWrapper.deviceType = StaticData.DeviceType;
    signupWrapper.gender = '';
    signupWrapper.password = this.signupForm.value.password;

    this.dataservice.signup(signupWrapper).subscribe((result) => {
      if (result && result.message === 'Success') {
        this.notifyService.showSuccess(
          'You have successfully registered with RearGuard',
          'Congratulations......'
        );
        this.dataservice
          .MakeUserFriendWithAdmin(result.data.customerData.accessToken)
          .subscribe((res) => {
            console.log('result', res);
          });
        this.router.navigateByUrl('/login');
      } else {
        this.notifyService.showWarning(result.message, '');
      }
    });
  }
}
