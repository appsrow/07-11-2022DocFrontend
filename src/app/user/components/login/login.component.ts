import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericResponse, LoginResponseData } from 'src/app/shared/models/shared.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UserService } from '../../services/user.service';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { EmailConfirmationRequestParameters } from 'src/app/brand/models/registration.model';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { Country, CountryList, GoogleLoginData, GoogleLoginRequestParameters, State, StateList, GenderList, RequestSmsRequestData, RequestSmsResponseData, VerifyCodeRequestData } from '../../models/registration.model';
import { UserProfileData, UserProfileRequestParameters } from '../../models/profile.model';
import { HeaderService } from 'src/app/shared/services/header.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'ng-otp-input/lib/models/config';
import { ConfirmMobileVerificationComponent } from 'src/app/shared/confirm-mobile-verification/confirm-mobile-verification.component';

declare const gtag: Function;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userLoginForm: FormGroup;
  googleUserRegistrationForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  showPassword!: boolean;
  isRememberChecked = true;
  email: string = '';
  password: string = '';
  showModal: boolean = false;
  countries: CountryList[] = [];
  states: StateList[] = [];
  errorString: string = '';
  showModelGoogle: boolean = false;
  googleUserId!: number;
  errorGoogleForm: string = '';
  googleUserSubmitted: boolean = false;
  dropdownSettings = {};
  genderSettings = {};
  countriesDialingCodesSettings = {};
  genderList: GenderList[] = [];
  selectedGenders: GenderList[] = [];
  countriesDialingCodes: any;
  phoneNumberVerfied: string;
  timeout: any = null;
  showVerifyBtn: boolean = false;
  phoneNumber: string = '';
  isVerifyCodeRequested: boolean = false;
  modalReference!: NgbModalRef;
  closeModal: string;
  submittedPhone: boolean = false;
  isVerifyButtonEnable: boolean = false;
  verifyOtp: string;
  showOtpRequiredText: boolean = false;
  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  @ViewChild('confirmMobileVerificationComponent') confirmMobileVerificationComponent!: ConfirmMobileVerificationComponent;
  config: Config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '40px',
      'height': '40px'
    }
  };
  phoneNumberOnly: string;
  countryCodeOnly: string;

  googleDatePickerOptions: FlatpickrOptions = {
    dateFormat: 'd-m-Y',
    maxDate: new Date(),
    onChange: (date: any) => {
      this.googleUserRegistrationForm.controls.dob.setValue(new Date(date[0]));
    },
  };
  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    public userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    private socialAuthService: SocialAuthService,
    private headerService: HeaderService,
    private modalService: NgbModal
  ) {
    this.userLoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
      password: ['', [Validators.required]],
    });
    this.googleUserRegistrationForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        dob: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
        selectedGenders: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: [[{ id: 207, itemName: 'Spain' }], [Validators.required]],
        phone: ['', [Validators.minLength(6), Validators.maxLength(15)]],
        selectedCountryDialingCode: ['']
      }
    );

  }

  async ngOnInit() {
    this.rememberLoginData();
    await this.getCountries();
    await this.getCountryDialingCodes();
    this.genderList = [
      { "id": 1, "itemName": "Male" },
      { "id": 2, "itemName": "Female" },
      { "id": 3, "itemName": "Other" }
    ];
    this.dropdownSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
    this.genderSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass custom-class"
    }
    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
    }
    // By default load all states of spain
    const response: State = await this.userService.getStates(207);
    if (response.success) {
      this.states = response.data;
      const newArray = this.states.map((item: any) => {
        return { id: item.id, itemName: item.state_name };
      });
      this.states = newArray;
    }
    this.googleUserRegistrationForm.valueChanges.subscribe(() => {
      if (this.googleUserRegistrationForm.valid) {
        this.errorGoogleForm = '';
        return;
      }
    });
  }

  async getCountries() {
    this.utilityService.showLoading();
    try {
      const response: Country = await this.userService.getCountries();
      if (response.success) {
        this.countries = response.data;
        const newArray = this.countries.map((item: any) => {
          return { id: item.id, itemName: item.country_name };
        });
        this.countries = newArray;
      }
      this.utilityService.hideLoading();
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCountryList');
      this.utilityService.hideLoading();
    }
  }


  async onChangeCountry(event: any) {
    try {
      this.googleUserRegistrationForm.controls.state.setValue("");
      if (event.id) {
        const response: State = await this.userService.getStates(event.id);
        if (response.success) {
          this.states = response.data;
          const newArray = this.states.map((item: any) => {
            return { id: item.id, itemName: item.state_name };
          });
          this.states = newArray;
        }
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetStateList');
      this.utilityService.hideLoading();
    }
  }
  rememberLoginData() {
    if (localStorage.getItem("userRememberMe") == 'yes') {
      this.email = localStorage.getItem("useremail") as string;
      this.password = localStorage.getItem("userpassword") as string;
      this.userLoginForm.controls['email'].setValue(this.email);
      this.userLoginForm.controls['password'].setValue(this.password);
      this.isRememberChecked = true;
    }
    else {
      this.isRememberChecked = false;
    }
  }
  rememberUser(event: { checked: any; }) {
    this.isRememberChecked = event.checked
  }


  async doLogin() {
    this.submitted = true;
    if (this.userLoginForm.invalid) {
      return;
    } else {
      this.utilityService.showLoading();
      try {
        const response: LoginResponseData = await this.userService.login(this.userLoginForm.value);
        this.errorString = '';
        if (response.success) {
          gtag("event", "login", {
            method: "Basic"
          });

          this.utilityService.hideLoading();
          window.localStorage.setItem('loginDetail', JSON.stringify(response.data));
          localStorage.setItem('useremail', this.userLoginForm.value.email);
          localStorage.setItem('userpassword', this.userLoginForm.value.password);
          if (this.isRememberChecked == true) {
            localStorage.setItem('userRememberMe', 'yes');
          }
          else {
            localStorage.setItem('userRememberMe', 'no');
          }
          this.utilityService.showSuccessToast('toast.loginSuccessfully');
          this.router.navigate(['/user/userTasks']).then(() => {
            location.reload();
          })
        }
        else {
          this.utilityService.hideLoading();
          this.showModal = false;
          this.error = response.message;
          if (this.error == 'Your email address is not confirmed' || this.error == 'Su direcci\u00f3n de correo electr\u00f3nico no est\u00e1 confirmada.') {
            this.error = '';
            this.showModal = true;
          }
        }
      }
      catch (error) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast('toast.FailedLogin');
      }
    }
  }
  async updateGoogleUserProfile() {
    this.googleUserSubmitted = true;
    if (this.googleUserRegistrationForm.invalid) {
      this.headerService.switchLanguage.subscribe(res => {
        if (res == 'es') {
          this.errorGoogleForm = "Por favor complete todos los campos obligatorios.";
        }
        else {
          this.errorGoogleForm = "Please fill all the mandetory fields.";
        }
      });
      return;
    }

    // const streamerName = localStorage.getItem('referralStreamerName');
    // // If its refferal link user its mandatory to verify mobile first
    // if(streamerName){
    //   console.log('streamer name ',this.phoneNumberVerfied);

    //   if(!this.phoneNumberVerfied){
    //     console.log('phoneNot verified');

    //     this.utilityService.hideLoading();
    //     this.headerService.switchLanguage.subscribe(res => {
    //       if (res == 'es') {
    //         this.errorGoogleForm = "Primero verifica tu número de teléfono";
    //       } 
    //       else {
    //         this.errorGoogleForm = 'Please verify your phone number first';
    //       }
    //     });
    //     this.utilityService.showErrorToast('toast.pleaseVerifyPhoneFirst');
    //     return;
    //   }
    // }

    try {
      // To fetch gender id 
      var genderVals = [];
      let genderValues: any;
      if (this.googleUserRegistrationForm.value.selectedGenders) {
        for (var item of this.googleUserRegistrationForm.value.selectedGenders) {
          genderVals.push(item.id);
        }
        genderValues = genderVals.toString();
      }
      const updateData: UserProfileRequestParameters = {
        user_id: this.googleUserId,
        first_name: this.googleUserRegistrationForm.value.firstName,
        last_name: this.googleUserRegistrationForm.value.lastName.trim(),
        dob: this.convert(this.googleUserRegistrationForm.value.dob),
        email: this.googleUserRegistrationForm.value.email,
        gender: genderValues,
        city: this.googleUserRegistrationForm.value.city,
        country: this.googleUserRegistrationForm.value.country[0].id,
        state: this.googleUserRegistrationForm.value.state[0].id,
        phone: this.googleUserRegistrationForm.value.phone,
        user_photo: null,
        country_dialing_code: this.googleUserRegistrationForm.value.selectedCountryDialingCode.length ? this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName : '',
        is_phone_confirmed: this.phoneNumberVerfied ? 1 : 0,
      };
      this.utilityService.showLoading();
      const response: UserProfileData = await this.userService.updateMyProfile(updateData);
      if (response.success) {
        this.utilityService.showSuccessToast('toast.profileDataUpdatedSucess');
        this.utilityService.hideLoading();
        var googleToken: any = localStorage.getItem('googleloginToken');
        var tokenData: any = JSON.parse(googleToken);
        const profileData = { user_info: response.data, api_token: tokenData.api_token };
        localStorage.setItem('loginDetail', JSON.stringify(profileData));
        localStorage.removeItem('googleloginToken');
        this.router.navigate(['/user/userTasks']);

      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.profileDetailsNotUpdate');
      this.utilityService.hideLoading();
    }
  }
  async doGoogleLogin() {
    try {
      const user: SocialUser = await this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
      const streamerName = localStorage.getItem('referralStreamerName');
      this.socialAuthService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
      if (user) {
        const googleData: GoogleLoginRequestParameters = {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName.trim(),
          authToken: user.authToken,
          is_social_sign_in: "1",
          // referral_streamer_name: streamerName ? streamerName : '',
          referral_streamer_name: '',
        };
        this.utilityService.showLoading();
        const response: GoogleLoginData = await this.userService.googleLogin(googleData);
        if (response.success) {
          gtag("event", "login", {
            method: "Google"
          });
          // localStorage.removeItem('referralStreamerName');
          this.utilityService.hideLoading();
          if (response.data.user_info.first_name != '' && response.data.user_info.last_name != '' && response.data.user_info.email != '' && response.data.user_info.state != null && response.data.user_info.country != null && response.data.user_info.dob != null) {
            localStorage.setItem('loginDetail', JSON.stringify(response.data));
            this.router.navigate(['/user/userTasks']);
          }
          else {
            this.showModelGoogle = true;
            localStorage.setItem('googleloginToken', JSON.stringify(response.data));
            this.googleUserRegistrationForm.controls.firstName.setValue(response.data.user_info.first_name);
            this.googleUserRegistrationForm.controls.lastName.setValue(response.data.user_info.last_name);
            this.googleUserRegistrationForm.controls.email.setValue(response.data.user_info.email);
            this.googleUserId = response.data.user_info.id;
          }
        }
        else {
          this.utilityService.hideLoading();
          this.error = response.message;
          this.utilityService.showErrorToast('toast.accountDeactivated');
        }
      }
    } catch (error) {
      console.log('err', error);
      this.socialAuthService.signOut();
      this.utilityService.hideLoading();
      // if (error == "Login providers not ready yet. Are there errors on your console?") {
      location.reload();
      return;
      // }
      // this.socialAuthService.signOut();
      // this.utilityService.hideLoading();
      // this.utilityService.showErrorToast('toast.registrationFailed');
    }
  }

  closeModelAfterCompletedTask() {
    this.showModal = false;
  }

  async sendConfirmationMail() {
    this.submitted = true;
    this.userLoginForm.value.email
    const emailData: EmailConfirmationRequestParameters = {
      email: this.userLoginForm.value.email
    };
    this.utilityService.showLoading();
    try {
      const response: GenericResponse = await this.userService.resendEmail(emailData);
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

  convert(str: any) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  async getCountryDialingCodes() {
    this.utilityService.showLoading();
    try {
      const response: Country = await this.userService.getCountries();
      if (response.success) {
        this.countriesDialingCodes = response.data;
        const newArray = this.countriesDialingCodes.map((item: any) => {
          return { id: item.id, itemName: item.dialing_code + ' ' + '(' + item.country_name + ')' };
        });
        this.countriesDialingCodes = newArray;
      }
      this.utilityService.hideLoading();
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCountryList');
      this.utilityService.hideLoading();
    }
  }

  showVerifyButton() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      if (this.googleUserRegistrationForm.value.phone) {
        this.googleUserRegistrationForm.get('selectedCountryDialingCode')?.setValidators([Validators.required]);
        this.googleUserRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
        this.showVerifyBtn = true;
      } else {
        this.googleUserRegistrationForm.controls['selectedCountryDialingCode'].clearValidators();
        this.googleUserRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
        this.showVerifyBtn = false;
      }

    }, 1000);
  }

  async verifyPhone() {
    this.phoneNumber = this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName + this.googleUserRegistrationForm.value.phone;
    this.phoneNumberOnly = this.googleUserRegistrationForm.value.phone;
    this.countryCodeOnly = this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName;
    this.isVerifyCodeRequested = false;
    this.confirmMobileVerificationComponent.openModal();
  }

  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }

  skipVerification() {
    this.modalReference.close();
  }

  async requestCode() {
    this.isVerifyCodeRequested = true;
    try {
      const requestBody: RequestSmsRequestData = {
        'phone_number': this.googleUserRegistrationForm.value.phone,
        'country_dialing_code': this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName
      }
      const response: RequestSmsResponseData = await this.userService.requestVerificationCode(requestBody);
      if (response.success) {
        this.utilityService.showSuccessToast('toast.verificationSmsSent');
      }
      else {
        this.utilityService.showErrorToast(response.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.FailedLogin');
    }
  }

  async verifyCode() {
    this.submittedPhone = true;
    if (!this.verifyOtp) {
      this.showOtpRequiredText = true;
      return;
    }
    try {
      const requestBody: VerifyCodeRequestData = {
        'phone_number': this.googleUserRegistrationForm.value.phone,
        'code': this.verifyOtp,
        'country_dialing_code': this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName
      }

      const response: RequestSmsResponseData = await this.userService.checkVerificationCode(requestBody);
      if (response.success) {
        this.utilityService.showSuccessToast('toast.phoneNumVerified');
        this.phoneNumberVerfied = this.phoneNumber;
        this.countriesDialingCodesSettings = {
          singleSelection: true,
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          enableSearchFilter: true,
          classes: "myclass custom-class",
          disabled: this.phoneNumberVerfied,
        }
        this.modalReference.close();
      }
      else {
        this.utilityService.showErrorToast(response.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.FailedLogin');
    }
  }

  onOtpChange(event: any) {
    if (event.length == 6) {
      this.verifyOtp = event;
      this.isVerifyButtonEnable = true;
      this.showOtpRequiredText = false;
    } else {
      this.verifyOtp = '';
      this.isVerifyButtonEnable = false;
    }
  }

  parentFunction(data?: any) {
    this.phoneNumberVerfied = data.phoneNumberVerfied;
    this.showVerifyBtn = false;
    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.phoneNumberVerfied,
    }
  }

}