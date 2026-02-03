import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  fogotPasswordForm = this.initForm();
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private notifyService: NotificationService,
    private router: Router
  ) {}

  // tslint:disable-next-line:typedef
  private initForm() {
    return this.fb.group({
      email: ['', Validators.required],
    });
  }
  // tslint:disable-next-line:typedef
  public onSubmit() {
    if (this.fogotPasswordForm.invalid) {
      return;
    }
    this.dataService
      .forgotPassword(this.fogotPasswordForm.value.email)
      .subscribe((result) => {
        if (result && result.message === 'Success') {
          this.router.navigateByUrl('/login');
        } else {
          this.notifyService.showWarning(result.message, '');
        }
      });
  }
}
