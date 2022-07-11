import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/shared/services/login.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';
import { BrandRegistrationRequestParameters, BrandRegistrationResponseValue } from '../../models/registration.model';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  brandRegistrationForm: FormGroup;
  siteKey: string;
  error: string = '';
  errorMessage: boolean = false;
  static emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/;
  submitted: boolean = false;
  showPassword!: boolean;
  showConfPassword!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    public loginService: LoginService,
    private brandService: BrandService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.siteKey = environment.siteKey;
    this.brandRegistrationForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!€¡"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.{8,})/)]],
      phone: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
      recaptcha: ['', Validators.required],
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

  }



  async doRegister() {
    this.submitted = true;
    if (this.brandRegistrationForm.invalid) {
      return;
    } else {
      const registerData: BrandRegistrationRequestParameters = {
        company_name: this.brandRegistrationForm.value.companyName,
        confirm_password: this.brandRegistrationForm.value.confirmPassword,
        email: this.brandRegistrationForm.value.email,
        password: this.brandRegistrationForm.value.password,
        phone: this.brandRegistrationForm.value.phone,
      };

      this.utilityService.showLoading();
      try {
        const response: BrandRegistrationResponseValue = await this.brandService.brandRegister(registerData);

        if (response.success) {
          this.utilityService.hideLoading();
          this.router.navigate(['/brand/emailconfirmation']);
        } else {
          this.utilityService.hideLoading();
          this.error = response.message;
          this.errorMessage = true;
        }
      } catch (error: any) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast(error.message);
      }
    }
  }

}
