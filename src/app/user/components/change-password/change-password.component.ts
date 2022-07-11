import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericResponse, ChangePasswordRequestParameters } from 'src/app/shared/models/shared.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  showPassword: boolean;
  showNewPassword : boolean;

  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private userService: UserService
  ) {
    this.changePasswordForm = this.formBuilder.group({
      oldpassword: ['', [Validators.required]],
      newpassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!€¡"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.{8,})/)]]
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

  }


  async changePassword() {
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    } else {
      const changePasswordDetails: ChangePasswordRequestParameters = {
        old_password: this.changePasswordForm.value.oldpassword,
        new_password: this.changePasswordForm.value.newpassword,
        token: this.activateRoute.snapshot.queryParamMap.get('token')
      };
      this.utilityService.showLoading();
      try {
        const response: GenericResponse = await this.userService.changePassword(changePasswordDetails);
        if (response.success) {
          this.utilityService.hideLoading();
          this.utilityService.showSuccessToast('toast.passwordChangeSuccess');
          this.router.navigate(['/user/userTasks']);
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
