import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericResponse, LoginRequestParameters, LoginResponseData } from 'src/app/shared/models/shared.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoginService } from 'src/app/shared/services/login.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandService } from '../../services/brand.service';
import { ModalDismissReasons, NgbModalConfig, NgbModal, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmailConfirmationRequestParameters } from '../../models/registration.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})
export class LoginComponent implements OnInit {


  brandLoginForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  isChecked = true;
  email!: any;
  password!: any;
  showPassword!: boolean;
  modalReference!: NgbModalRef;
  closeModal!: string;
  showModal: boolean = false;
  constructor(
    config: NgbModalConfig,
    private formBuilder: FormBuilder,
    public loginService: LoginService,
    public authService: AuthService,
    private router: Router,
    private utilityService: UtilityService,
    private brandService: BrandService,
    private modalService: NgbModal,
    private route: ActivatedRoute
  ) {
    this.brandLoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/)]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.AutoLogin();
  }

  AutoLogin() {
    if (localStorage.getItem("rememberMe") == 'yes') {
      this.email = localStorage.getItem("email");
      this.password = localStorage.getItem("password");
      this.brandLoginForm.controls['email'].setValue(this.email);
      this.brandLoginForm.controls['password'].setValue(this.password);
      this.isChecked = true;
    }
    else {
      this.isChecked = false;
    }
  }
  checkCheckBoxvalue(event: { checked: any; }) {
    this.isChecked = event.checked
  }
  async doLogin() {
    this.showModal = false;
    this.submitted = true;
    if (this.brandLoginForm.invalid) {
      return;
    } else {
      this.utilityService.showLoading();
      try {
        const loginRequestParameters: LoginRequestParameters = {
          'email': this.brandLoginForm.value.email,
          'password': this.brandLoginForm.value.password
        }
        const response: LoginResponseData = await this.brandService.brandLogin(loginRequestParameters);
        if (response.success) {
          this.showModal = false;
          this.utilityService.hideLoading();
          window.localStorage.setItem('loginDetail', JSON.stringify(response.data));
          localStorage.setItem('email', this.brandLoginForm.value.email);
          localStorage.setItem('password', this.brandLoginForm.value.password);
          if (this.isChecked == true) {
            localStorage.setItem('rememberMe', 'yes');
          }
          else {
            localStorage.setItem('rememberMe', 'no');
          }

          // check if the url is having create campaign route
          if (this.route.snapshot.queryParams['page'] == 'campaignTarget') {
            this.router.navigate(['brand/campaignTarget']).then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            });
          } else {
            this.router.navigate(['/home']).then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            });
          }

          this.utilityService.showSuccessToast('toast.loginSuccessfully');
        } else {
          this.utilityService.hideLoading();
          this.showModal = false;
          this.error = response.message;
          if (this.error == 'Your email address is not confirmed' || this.error == 'Su direcci\u00f3n de correo electr\u00f3nico no est\u00e1 confirmada.') {
            this.error = '';
            this.showModal = true;
          }
        }
      } catch (error) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast('toast.FailedLogin');
      }
    }
  }

  triggerModal(content: any) {
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  closeModelAfterCompletedTask() {
    this.showModal = false;
  }

  async sendConfirmationMail() {
    this.submitted = true;
    this.brandLoginForm.value.email
    const data: EmailConfirmationRequestParameters = {
      email: this.brandLoginForm.value.email
    };

    this.utilityService.showLoading();
    try {
      const response: GenericResponse = await this.brandService.resendEmail(data);
      if (response.success) {
        this.utilityService.showSuccessToast('toast.activationLinkMail');
        this.closeModelAfterCompletedTask();
        this.utilityService.hideLoading();
      } else {
        this.utilityService.hideLoading();
        this.error = response.message;
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }
}
