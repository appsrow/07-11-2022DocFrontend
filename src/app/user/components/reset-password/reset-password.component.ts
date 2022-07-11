import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericResponse, ResetPasswordRequestParameters } from 'src/app/shared/models/shared.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  showPassword!: boolean;
  showConfPassword! : boolean;

  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private router: Router,
    private toastr: ToastrService,
    private activateRoute: ActivatedRoute,
    private userService: UserService
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!€¡"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.{8,})/)]],
      confirmPassword: ['', Validators.required]
    },
    {
      validator: UtilityService.MustMatch('password', 'confirmPassword')
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


  ngOnInit() {
    if(!this.activateRoute.snapshot.queryParamMap.get('token')){
      this.router.navigate(['/user/linkExpired']);
    }
  }

  

  async resetPassword() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    } else {
      const resetPasswordDetails: ResetPasswordRequestParameters = {
        password: this.resetPasswordForm.value.password,
        password_confirmation: this.resetPasswordForm.value.confirmPassword,
        token: this.activateRoute.snapshot.queryParamMap.get('token')
      };
      this.utilityService.showLoading();
      try {
        const response: GenericResponse = await this.userService.resetPassword(resetPasswordDetails);
        if (response.success) {
          this.utilityService.hideLoading();
          this.utilityService.showSuccessToast('toast.passwordResetSuccess');
          this.router.navigate(['/user/login']);
        }
        else {
          this.error = response.message;
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
    }
  }

}