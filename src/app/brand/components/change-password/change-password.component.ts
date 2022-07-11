import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericResponse, ChangePasswordRequestParameters } from 'src/app/shared/models/shared.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  showPassword!: boolean;
  showNewPassword! : boolean;

  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private brandService: BrandService
  ) {
    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!€¡"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.{8,})/)]],
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!€¡"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.{8,})/)]]
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
        old_password: this.changePasswordForm.value.oldPassword,
        new_password: this.changePasswordForm.value.newPassword,
        token: this.activateRoute.snapshot.queryParamMap.get('token')
      };
      this.utilityService.showLoading();
      try {
        const response: GenericResponse = await this.brandService.changePassword(changePasswordDetails);
        if (response.success) {
          this.utilityService.hideLoading();
          this.utilityService.showSuccessToast('toast.passwordChangeSuccess');
          this.router.navigate(['/brand/myCampaign']);
        } 
        else {
          this.error = response.message;
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
    }
  }
}