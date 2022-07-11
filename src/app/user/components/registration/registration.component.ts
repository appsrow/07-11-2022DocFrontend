import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { UserService } from '../../services/user.service';
import { Country, CountryList, GenderList, GoogleLoginData, GoogleLoginRequestParameters, RegistrationRequestParameters, RequestSmsRequestData, RequestSmsResponseData, State, StateList, VerifyCodeRequestData } from '../../models/registration.model';
import { UserProfileData, UserProfileRequestParameters } from '../../models/profile.model';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { HeaderService } from 'src/app/shared/services/header.service';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'ng-otp-input/lib/models/config';
import { ConfirmMobileVerificationComponent } from 'src/app/shared/confirm-mobile-verification/confirm-mobile-verification.component';

declare const gtag: Function;

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  userRegistrationForm: FormGroup;
  //userPhoneVerificationForm: FormGroup;
  googleUserRegistrationForm: FormGroup;
  submitted: boolean = false;
  submittedPhone: boolean = false;
  googleUserSubmitted: boolean = false;
  siteKey: string;
  error: string = '';
  errorGoogleForm: string = '';
  countries: CountryList[] = [];
  countriesDialingCodes: any;
  stateList: StateList[] = [];
  showPassword!: boolean;
  showConfPassword!: boolean;
  showModel: boolean = false;
  dobDate: Date;
  googleUserDobDate: Date;
  googleUserId: any;
  dropdownList: any = [];
  genderList: GenderList[] = [];
  selectedGenders: GenderList[] = [];
  dropdownSettings = {};
  genderSettings = {};
  countriesDialingCodesSettings = {};
  phoneNumber: string = '';
  timeout: any = null;
  modalReference!: NgbModalRef;
  closeModal: string;
  showVerifyBtn: boolean = false;
  isVerifyCodeRequested: boolean = false;
  phoneNumberVerfied: string;
  formType: string = 'registrationForm';
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
  streamerName: string;

  datePickerOptions: FlatpickrOptions = {
    dateFormat: 'd-m-Y',
    maxDate: new Date(),
    onChange: (date: any) => {
      this.dobDate = new Date(date[0]);
      this.userRegistrationForm.controls.birthDate.setValue(new Date(date[0]));

    },
  };
  googleDatePickerOptions: FlatpickrOptions = {
    dateFormat: 'd-m-Y',
    maxDate: new Date(),
    onChange: (date: any) => {
      this.googleUserDobDate = new Date(date[0]);
      this.googleUserRegistrationForm.controls.dob.setValue(new Date(date[0]));
    },
  };
  constructor(
    private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private router: Router,
    private toastr: ToastrService,
    private socialAuthService: SocialAuthService,
    private userService: UserService,
    private headerService: HeaderService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {
    this.siteKey = environment.siteKey;
    this.userRegistrationForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        birthDate: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/)]],
        selectedGenders: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        selectedCountries: [[{ id: 207, itemName: 'Spain' }], [Validators.required]],
        phone: ['', [Validators.minLength(6), Validators.maxLength(15)]],
        recaptcha: ['', Validators.required],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!€¡"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.{8,})/)]],
        confirmPassword: ['', Validators.required],
        selectedCountryDialingCode: ['']
      },
      {
        validator: UtilityService.MustMatch('password', 'confirmPassword')
      }
    );
    this.googleUserRegistrationForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        dob: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/)]],
        selectedGenders: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        selectedCountries: [[{ id: 207, itemName: 'Spain' }], [Validators.required]],
        phone: ['', [Validators.minLength(6), Validators.maxLength(15)]],
        selectedCountryDialingCode: ['']
      }
    );
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

  async ngOnInit() {
    await this.getCountries();
    await this.getCountryDialingCodes();
    await this.activatedRoute.queryParams.subscribe(params => {
      this.streamerName = params.ref;
    });
    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.genderList = [
          { "id": 1, "itemName": "Masculino" },
          { "id": 2, "itemName": "Mujer" },
          { "id": 3, "itemName": "Otro" }
        ];
      } else {
        this.genderList = [
          { "id": 1, "itemName": "Male" },
          { "id": 2, "itemName": "Female" },
          { "id": 3, "itemName": "Other" }
        ];
      }

    });
    this.dropdownSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
    };
    this.genderSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass custom-class"
    };
    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.phoneNumberVerfied,
    };

    // Get all the states of spain by default
    const response: State = await this.userService.getStates(207);
    if (response.success) {
      this.stateList = response.data;
      const newArray = this.stateList.map((item: any) => {
        return { id: item.id, itemName: item.state_name };
      });
      this.stateList = newArray;
    }
    // check if the streamer is a valid streamer
    let referralStreamerName = localStorage.getItem('referralStreamerName');
    if (referralStreamerName) {
      this.checkStreamerName(this.streamerName);
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
      this.userRegistrationForm.controls.state.setValue("");
      if (event.id) {
        const response: State = await this.userService.getStates(event.id);
        if (response.success) {
          this.stateList = response.data;
          const newArray = this.stateList.map((item: any) => {
            return { id: item.id, itemName: item.state_name };
          });
          this.stateList = newArray;
        }
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetStateList');
      this.utilityService.hideLoading();
    }
  }

  async onChangeCountryGoogleForm(event: any) {
    try {
      this.googleUserRegistrationForm.controls.state.setValue("");
      if (event.id) {
        const response: State = await this.userService.getStates(event.id);
        if (response.success) {
          this.stateList = response.data;
          const newArray = this.stateList.map((item: any) => {
            return { id: item.id, itemName: item.state_name };
          });
          this.stateList = newArray;
        }
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetStateList');
      this.utilityService.hideLoading();
    }
  }

  async doRegistration() {
    this.submitted = true;
    if (this.userRegistrationForm.invalid) {
      return;
    }
    else {
      this.utilityService.showLoading();
      var genderVals = [];
      let genderValues: any;
      if (this.userRegistrationForm.value.selectedGenders) {
        for (var item of this.userRegistrationForm.value.selectedGenders) {
          genderVals.push(item.id);
        }
        genderValues = genderVals.toString();
      }

      const streamerName = this.streamerName;
      // If its refferal link user its mandatory to verify mobile first
      // if (streamerName) {
      //   if (!this.phoneNumberVerfied) {
      //     this.utilityService.hideLoading();
      //     this.headerService.switchLanguage.subscribe(res => {
      //       if (res == 'es') {
      //         this.error = "Primero verifica tu número de teléfono";
      //       }
      //       else {
      //         this.error = 'Please verify your phone number first';
      //       }
      //     });
      //     this.utilityService.showErrorToast('toast.pleaseVerifyPhoneFirst');
      //     return;
      //   }
      // }

      const registerData: RegistrationRequestParameters = {
        first_name: this.userRegistrationForm.value.firstName,
        last_name: this.userRegistrationForm.value.lastName.trim(),
        gender: genderValues,
        dob: this.convert(this.dobDate),
        password: this.userRegistrationForm.value.password,
        country_dialing_code: this.userRegistrationForm.value.selectedCountryDialingCode.length ? this.userRegistrationForm.value.selectedCountryDialingCode[0].itemName : '',
        phone: this.userRegistrationForm.value.phone,
        is_phone_confirmed: this.phoneNumberVerfied ? 1 : 0,
        email: this.userRegistrationForm.value.email,
        country: this.userRegistrationForm.value.selectedCountries[0].id,
        city: this.userRegistrationForm.value.city,
        state: this.userRegistrationForm.value.state[0].id,
        confirm_password: this.userRegistrationForm.value.confirmPassword,
        referral_streamer_name: streamerName ? streamerName : '',
      };
      try {
        const response = await this.userService.register(registerData);
        if (response.success) {
          this.utilityService.hideLoading();
          localStorage.removeItem('referralStreamerName');
          this.router.navigate(['/user/emailconfirmation']);
        } else {
          this.error = response.message;
          this.utilityService.hideLoading();
        }
      } catch (err) {
        this.utilityService.showErrorToast('toast.registrationFailed');
        this.utilityService.hideLoading();
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

    const streamerName = this.streamerName;
    // If its refferal link user its mandatory to verify mobile first
    // if (streamerName) {
    //   if (!this.phoneNumberVerfied) {
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
        country: this.googleUserRegistrationForm.value.selectedCountries[0].id,
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
        localStorage.removeItem('referralStreamerName');
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
      const streamerName = this.streamerName;
      if (user) {
        const googleData: GoogleLoginRequestParameters = {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName.trim(),
          authToken: user.authToken,
          is_social_sign_in: "1",
          referral_streamer_name: streamerName ? streamerName : '',
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
            this.showModel = true;
            localStorage.setItem('googleloginToken', JSON.stringify(response.data));
            this.googleUserRegistrationForm.controls.firstName.setValue(response.data.user_info.first_name);
            this.googleUserRegistrationForm.controls.lastName.setValue(response.data.user_info.last_name);
            this.googleUserRegistrationForm.controls.email.setValue(response.data.user_info.email);
            this.googleUserId = response.data.user_info.id;
          }
        } else {
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

  convert(str: any) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  showVerifyButton(formType: string) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      if (formType === 'registrationForm') {
        if (this.userRegistrationForm.value.phone) {
          // country code required
          this.userRegistrationForm.get('selectedCountryDialingCode')?.setValidators([Validators.required]);
          this.userRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
          this.showVerifyBtn = true;
        } else {
          this.userRegistrationForm.controls['selectedCountryDialingCode'].clearValidators();
          this.userRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
          this.showVerifyBtn = false;
        }
      }
      if (formType === 'googleRegistrationForm') {
        if (this.googleUserRegistrationForm.value.phone) {
          this.googleUserRegistrationForm.get('selectedCountryDialingCode')?.setValidators([Validators.required]);
          this.googleUserRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
          this.showVerifyBtn = true;
        } else {
          this.googleUserRegistrationForm.controls['selectedCountryDialingCode'].clearValidators();
          this.googleUserRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
          this.showVerifyBtn = false;
        }
      }
    }, 1000);
  }

  async verifyPhone(content: any, formType: string) {
    if (this.phoneNumberVerfied) {
      return;
    }
    this.formType = formType;
    if (formType === 'registrationForm') {
      if (!this.userRegistrationForm.value.selectedCountryDialingCode || !this.userRegistrationForm.value.phone) {
        this.userRegistrationForm.get('selectedCountryDialingCode')?.setValidators([Validators.required]);
        this.userRegistrationForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
        this.submittedPhone = true;
        return;
      }
      this.phoneNumber = this.userRegistrationForm.value.selectedCountryDialingCode[0].itemName + this.userRegistrationForm.value.phone;
    }
    if (formType === 'googleRegistrationForm') {
      this.phoneNumber = this.googleUserRegistrationForm.value.selectedCountryDialingCode[0] ? this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName + this.googleUserRegistrationForm.value.phone : '';
    }
    this.isVerifyCodeRequested = false;
    this.phoneNumberOnly = (formType === 'registrationForm') ? this.userRegistrationForm.value.phone : this.googleUserRegistrationForm.value.phone;
    this.countryCodeOnly = (formType === 'registrationForm') ? this.userRegistrationForm.value.selectedCountryDialingCode[0].itemName : this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName;

    this.confirmMobileVerificationComponent.openModal();
    // this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop'});
    // this.modalReference.result.then((res) => {
    //   this.closeModal = `Closed with: ${res}`;
    // },
    //   (res) => {
    //     this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    //   });

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

  // async requestCode(){
  //   this.utilityService.showLoading();
  //   try {
  //     const requestBody: RequestSmsRequestData = {
  //       'phone_number': this.userRegistrationForm.value.phone ? this.userRegistrationForm.value.phone : this.googleUserRegistrationForm.value.phone,
  //       'country_dialing_code': this.userRegistrationForm.value.selectedCountryDialingCode ? this.userRegistrationForm.value.selectedCountryDialingCode[0].itemName : this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName
  //     }

  //     const response: RequestSmsResponseData = await this.userService.requestVerificationCode(requestBody);

  //     if (response.success) {
  //       this.utilityService.hideLoading();
  //       this.isVerifyCodeRequested = true;
  //       this.utilityService.showSuccessToast('toast.verificationSmsSent');
  //     }
  //     else {
  //       this.utilityService.hideLoading();
  //       this.utilityService.showErrorToast(response.message);
  //     }
  //   }
  //   catch (error) {
  //     console.log('error', error);

  //     this.utilityService.hideLoading();
  //     this.utilityService.showErrorToast('toast.somethingWentWrong');
  //   }
  // }

  // async verifyCode(formType: string){
  //   if(this.phoneNumberVerfied || !this.verifyOtp){
  //     if(!this.verifyOtp){
  //       this.showOtpRequiredText =  true;
  //     }
  //     return;
  //   }else{
  //     this.showOtpRequiredText =  false;
  //   }
  //   this.submittedPhone = true;
  //   try {
  //     this.utilityService.showLoading();
  //     const requestBody: VerifyCodeRequestData = {
  //       'phone_number': this.userRegistrationForm.value.phone ? this.userRegistrationForm.value.phone : this.googleUserRegistrationForm.value.phone,
  //       'code': this.verifyOtp,
  //       'country_dialing_code': this.userRegistrationForm.value.selectedCountryDialingCode ? this.userRegistrationForm.value.selectedCountryDialingCode[0].itemName : this.googleUserRegistrationForm.value.selectedCountryDialingCode[0].itemName
  //     }

  //     const response: RequestSmsResponseData = await this.userService.checkVerificationCode(requestBody);

  //     if (response.success) {
  //       this.utilityService.hideLoading();
  //       this.utilityService.showSuccessToast('toast.phoneNumVerified');
  //       this.phoneNumberVerfied = this.phoneNumber;
  //       this.countriesDialingCodesSettings = {
  //         singleSelection: true,
  //         selectAllText: 'Select All',
  //         unSelectAllText: 'UnSelect All',
  //         enableSearchFilter: true,
  //         classes: "myclass custom-class",
  //         disabled: this.phoneNumberVerfied,
  //       }
  //       this.modalReference.close();
  //     }
  //     else {
  //       this.utilityService.hideLoading();
  //       this.utilityService.showErrorToast(response.message);
  //     }
  //   }
  //   catch (error) {
  //     this.utilityService.hideLoading();
  //     this.utilityService.showErrorToast('toast.somethingWentWrong');
  //   }
  // }

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

  async checkStreamerName(referralName: string) {
    const requestBody: any = {
      'streamer_name': referralName
    }
    try {
      this.utilityService.showLoading();
      const response: any = await this.userService.checkReferralLink(requestBody);
      if (response.success) {
        this.utilityService.hideLoading();
        localStorage.setItem('referralStreamerName', referralName);
      } else {
        this.utilityService.showErrorToast(response.message);
        this.utilityService.hideLoading();
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }
}