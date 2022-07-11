import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginResponseData } from 'src/app/shared/models/shared.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoginService } from 'src/app/shared/services/login.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { HeaderService } from '../../../shared/services/header.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  adminLoginForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  showPassword!: boolean;
  switchLanguage: string = 'es';
  constructor(
    private formBuilder: FormBuilder,
    public loginService: LoginService,
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private adminService: AdminService,
    public headerService: HeaderService,
    public translateService: TranslateService,
  ) {
    this.adminLoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/)]],
      password: ['', [Validators.required,]],
    });
    this.headerService.switchLanguage.subscribe(res => {
      this.switchLanguage = res;
      translateService.setDefaultLang(res);
      translateService.use(res);
    });
    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.switchLanguage = res;
      } else {
        this.switchLanguage = '';
      }
    })
  }

  ngOnInit(): void {
  }
  selectLanguage(language: string) {
    this.headerService.switchLanguage.next(language);
    localStorage.setItem('selectedLanguage', language);
  }

  async doLogin() {
    this.submitted = true;
    if (this.adminLoginForm.invalid) {
      return;
    } else {
      this.utilityService.showLoading();
      try {
        const response: LoginResponseData = await this.adminService.adminLogin(this.adminLoginForm.value);
        if (response.success) {
          this.utilityService.hideLoading();
          window.localStorage.setItem('loginDetail', JSON.stringify(response.data));

          this.utilityService.showSuccessToast('toast.loginSuccessfully');
          this.router.navigate(['/admin/dashboard']);
        }
        else {
          this.utilityService.hideLoading();
          this.error = response.message;
        }
      } catch (error) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast('toast.FailedLogin');
      }
    }
  }

}