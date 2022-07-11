import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GenericResponse } from 'src/app/shared/models/shared.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  error: string = '';
  static emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/;
  submitted: boolean = false;
  resetLinkSent: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private brandService: BrandService,
    public authService: AuthService,
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/)]],
    });
  }

  ngOnInit(): void {

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
        const response: GenericResponse = await this.brandService.forgotPassword(this.forgotPasswordForm.value);
        if (response.success) {
          this.resetLinkSent = true;
          this.error = '';
          this.forgotPasswordForm.get('email')?.clearValidators();
          this.forgotPasswordForm.controls.email.setValue('');
          this.utilityService.hideLoading();

        } else {
          this.error = response.message;
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
    }
  }

}