import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GenericResponse } from 'src/app/shared/models/shared.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  resetLinkSent: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private userService: UserService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
    });
  }

  customValidator(control: FormControl) {
    let inputValue = control.value;
    if (inputValue) {
      return null;
    } else {
      return {
        invalid: true
      }
    }
  }


  ngOnInit(): void {
  }

  async forgotPassword() {
    this.submitted = true;
    this.resetLinkSent = false;
    this.error = '';
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    else {
      try {
        this.utilityService.showLoading();
        const response: GenericResponse = await this.userService.forgotPassword(this.forgotPasswordForm.value);
        if (response.success) {
          this.resetLinkSent = true;
          this.error = '';
          this.forgotPasswordForm.controls.email.setValue('');
          this.utilityService.hideLoading();

        } else {
          this.error = response.message;
          this.utilityService.hideLoading();
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
    }
  }

}