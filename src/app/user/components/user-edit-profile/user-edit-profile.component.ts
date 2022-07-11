import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { UserProfileData, UserProfileRequestParameters } from '../../models/profile.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Country, CountryList, State, StateList, GenderList, RequestSmsRequestData, RequestSmsResponseData, VerifyCodeRequestData } from '../../models/registration.model';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'ng-otp-input/lib/models/config';
import { ConfirmMobileVerificationComponent } from 'src/app/shared/confirm-mobile-verification/confirm-mobile-verification.component';
@Component({
  selector: 'app-user-edit-profile',
  templateUrl: './user-edit-profile.component.html',
  styleUrls: ['./user-edit-profile.component.scss']
})
export class UserEditProfileComponent implements OnInit {
  @ViewChild('confirmMobileVerificationComponent') confirmMobileVerificationComponent!: ConfirmMobileVerificationComponent;

  myProfileForm: FormGroup;
  submitted: boolean = false;
  error: boolean = false;
  imageError: string = '';
  countries: CountryList[] = [];
  stateList: StateList[] = [];
  image: any;
  country: string = '';
  imgResultBeforeCompress: string = '';
  imgResultAfterCompress: string = '';
  maxDate = new Date();
  isProfileDataLoaded: boolean = false;
  dropdownSettings = {};
  isStateLoaded: boolean = false;
  genderList: GenderList[] = [];
  countriesDialingCodesSettings = {};
  countriesDialingCodes: any;
  phoneNumberVerfied: string;
  timeout: any = null;
  showVerifyBtn: boolean = false;
  phoneNumber: string = '';
  isVerifyCodeRequested: boolean = false;
  modalReference!: NgbModalRef;
  closeModal: string;
  userPhoneVerificationForm: FormGroup;
  submittedPhone: boolean = false;
  verificationSmsSent: boolean = false;
  isVerifyButtonEnable: boolean = false;
  verifyOtp: string;
  showOtpRequiredText: boolean = false;
  isVerifyCodeBtnClicked: boolean = false;
  phoneNumberOnly: string;
  countryCodeOnly: string;
  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
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

  constructor(
    private userService: UserService,
    private formbuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public utilityService: UtilityService,
    private authService: AuthService,
    private modalService: NgbModal,
    private elementRef: ElementRef

  ) {
    this.myProfileForm = this.formbuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(/^([a-zA-Z0-9]+\s?)*$/)]],
      phone: ['', [Validators.minLength(6), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
      gender: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      photo: [''],
      selectedCountryDialingCode: ['']
    });
    this.userPhoneVerificationForm = this.formbuilder.group({
      verifyCode1: [''],
      verifyCode2: [''],
      verifyCode3: [''],
      verifyCode4: [''],
      verifyCode5: [''],
      verifyCode6: ['']
    });
  }
  datePicker: FlatpickrOptions = {};

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
    this.genderList = [
      { "id": 1, "itemName": "Male" },
      { "id": 2, "itemName": "Female" },
      { "id": 3, "itemName": "Other" }
    ];

    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    }

    await this.getCountries();
    await this.getCountryDialingCodes();
    await this.getProfile();


    this.dropdownSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };



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
    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCountryList');
      this.utilityService.hideLoading();
    }
  }

  async onChangeCountry(event: any) {
    try {
      if (event) {
        this.myProfileForm.controls.state.setValue("");
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

  async getProfile() {
    this.utilityService.showLoading();
    try {
      const response: UserProfileData = await this.userService.getProfile();
      if (response.success) {
        let countryVals = response.data.user_info.country.split(',');
        var countryResult = [];

        for (let country of this.countries) {
          for (let countryId of countryVals) {
            if (country.id === parseInt(countryId)) {
              countryResult.push({ id: country.id, itemName: country.itemName });
            }
          }
        }

        this.utilityService.hideLoading();
        if (response.data.user_info.country_dialing_code) {
          var countryDialingCodeResult = [];
          for (let countryDialingCode of this.countriesDialingCodes) {
            if (response.data.user_info.country_dialing_code === countryDialingCode.itemName) {
              countryDialingCodeResult.push({ id: countryDialingCode.id, itemName: countryDialingCode.itemName });
            }
          }
          this.myProfileForm.controls.selectedCountryDialingCode.setValue(countryDialingCodeResult);
        }

        this.myProfileForm.controls.firstName.setValue(response.data.user_info.first_name);
        this.myProfileForm.controls.lastName.setValue(response.data.user_info.last_name);
        this.myProfileForm.controls.dob.setValue(new Date(response.data.user_info.dob));
        this.myProfileForm.controls.email.setValue(response.data.user_info.email);
        this.myProfileForm.controls.phone.setValue(response.data.user_info.phone);
        this.myProfileForm.controls.gender.setValue(response.data.user_info.gender);
        this.myProfileForm.controls.country.setValue(countryResult);
        this.myProfileForm.controls.city.setValue(response.data.user_info.city);


        response.data.user_photo ? this.myProfileForm.controls.photo.setValue(response.data.user_photo) : '';

        const stateResponse: State = await this.userService.getStates(parseInt(response.data.user_info.country));
        if (stateResponse.success) {
          this.stateList = stateResponse.data;
          const newArray = this.stateList.map((item: any) => {
            return { id: item.id, itemName: item.state_name };
          });
          this.stateList = newArray;
          var stateResult = this.stateList.filter((dropdownListItem: any) => dropdownListItem.id == parseInt(response.data.user_info.state));
          this.myProfileForm.controls.state.setValue(stateResult);
          this.isStateLoaded = true;
        }

        this.datePicker = {
          defaultDate: new Date(response.data.user_info.dob),
          dateFormat: 'd-m-Y',
          maxDate: new Date(),
          onChange: (date: any) => {
            this.myProfileForm.controls.dob.setValue(new Date(date[0]));
          }
        };
        this.isProfileDataLoaded = true;
        if (response.data.user_info.is_phone_confirmed === 1) {
          this.showVerifyBtn = true;
          this.phoneNumberVerfied = response.data.user_info.phone;
          this.countriesDialingCodesSettings = {
            singleSelection: true,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: "myclass custom-class",
            disabled: true,
          }
        } else {
          this.showVerifyBtn = true;
        }
      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedFetchProfileData');
      this.utilityService.hideLoading();
    }
  }
  async updateProfile() {
    this.submitted = true;
    if (this.myProfileForm.invalid) {
      this.error = true;
      return;
    }
    try {
      if (this.myProfileForm.value.photo) {
        this.image = this.myProfileForm.value.photo;
      }
      else {
        this.image = null;
      }

      const updateData: UserProfileRequestParameters = {
        user_id: (this.authService.getLoggedInUserDetail()).user_info.id,
        first_name: this.myProfileForm.value.firstName,
        last_name: this.myProfileForm.value.lastName.trim(),
        dob: this.convert(this.myProfileForm.value.dob),
        email: this.myProfileForm.value.email,
        gender: this.myProfileForm.value.gender,
        city: this.myProfileForm.value.city,
        country: this.myProfileForm.value.country[0].id,
        state: this.myProfileForm.value.state[0].id,
        phone: this.myProfileForm.value.phone ? this.myProfileForm.value.phone : '',
        user_photo: this.image,
        country_dialing_code: this.myProfileForm.value.selectedCountryDialingCode.length ? this.myProfileForm.value.selectedCountryDialingCode[0].itemName : '',
        is_phone_confirmed: this.phoneNumberVerfied ? 1 : 0,
      };
      this.utilityService.showLoading();
      const response: UserProfileData = await this.userService.updateMyProfile(updateData);
      if (response.success) {
        this.utilityService.showSuccessToast('toast.profileDataUpdatedSucess');
        this.utilityService.hideLoading();
        this.router.navigate(['/user/userProfile'])
          .then(() => {
            window.location.reload();
          });
      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedFetchProfileData');
      this.utilityService.hideLoading();
    }
  }

  convert(str: any) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  onSelectProfile(event: any) {
    const file: File = event.target.files[0];
    if (file.size === 0 || (file.size / 1000) > 500) {
      return this.imageError = 'Image size should not greater than 500 KB';
    }
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let filePath = file.name;
      let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
      if (!allowedExtensions.exec(filePath)) {
        return this.imageError = 'Image should be in PNG or JPG format';
      } else {
        this.imageError = '';
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
          this.myProfileForm.controls.photo.setValue(event.target.result);
        }
      }
    }
  }

  deletePhoto(): void {
    this.myProfileForm.controls.photo.setValue('');
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

  async verifyPhone(content?: any) {
    if (this.verificationSmsSent || this.phoneNumberVerfied || this.myProfileForm.value.selectedCountryDialingCode == '') {
      if (this.myProfileForm.value.selectedCountryDialingCode == '') {
        this.myProfileForm.get('selectedCountryDialingCode')?.setValidators([Validators.required]);
        this.myProfileForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
        this.submitted = true;
      }
      return;
    }
    this.phoneNumber = this.myProfileForm.value.selectedCountryDialingCode[0].itemName + this.myProfileForm.value.phone;
    this.isVerifyCodeRequested = false;
    // this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    // this.modalReference.result.then((res) => {
    //   this.closeModal = `Closed with: ${res}`;
    // },
    //   (res) => {
    //     this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    //   });
    this.isVerifyCodeBtnClicked = true;
    this.phoneNumberOnly = this.myProfileForm.value.phone;
    this.countryCodeOnly = this.myProfileForm.value.selectedCountryDialingCode[0].itemName;

    this.confirmMobileVerificationComponent.openModal();
  }

  private getDismissReason(reason: any): string {
    this.verificationSmsSent = false;
    this.phoneNumberVerfied = '';
    this.userPhoneVerificationForm.clearValidators();
    this.userPhoneVerificationForm.reset();
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  // async requestCode(){
  //   try {
  //    this.utilityService.showLoading();
  //     const requestBody: RequestSmsRequestData = {
  //       'phone_number': this.myProfileForm.value.phone,
  //       'country_dialing_code': this.myProfileForm.value.selectedCountryDialingCode[0].itemName
  //     }
  //     const response: RequestSmsResponseData = await this.userService.requestVerificationCode(requestBody);
  //     if (response.success) {
  //       this.utilityService.hideLoading();
  //       this.verificationSmsSent = true;
  //       this.isVerifyCodeRequested = true;
  //       this.utilityService.showSuccessToast('toast.verificationSmsSent');
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

  // async verifyCode(){
  //   if(this.phoneNumberVerfied || !this.verifyOtp){
  //     if(!this.verifyOtp){
  //       this.showOtpRequiredText = true;
  //     }
  //     return;
  //   }

  //   this.submittedPhone = true;
  //   if(!this.userPhoneVerificationForm.valid){
  //     return;
  //   }
  //   try {
  //     const requestBody: VerifyCodeRequestData = {
  //       'phone_number': this.myProfileForm.value.phone,
  //       'code': this.verifyOtp,
  //       'country_dialing_code': this.myProfileForm.value.selectedCountryDialingCode[0].itemName
  //     }

  //     const response: RequestSmsResponseData = await this.userService.checkVerificationCode(requestBody);

  //     if (response.success) {
  //       this.utilityService.showSuccessToast('toast.phoneNumVerified');
  //       this.phoneNumberVerfied = this.phoneNumber;
  //       this.showVerifyBtn = false;
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
  //       this.utilityService.showErrorToast(response.message);
  //     }
  //   }
  //   catch (error) {
  //     this.utilityService.hideLoading();
  //     this.utilityService.showErrorToast('toast.somethingWentWrong');
  //   }
  // }

  skipVerification() {
    this.modalReference.close();
  }

  showVerifyButton() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      if (this.myProfileForm.value.phone) {
        this.myProfileForm.get('selectedCountryDialingCode')?.setValidators([Validators.required]);
        this.myProfileForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
        this.showVerifyBtn = true;
      } else {
        this.myProfileForm.controls['selectedCountryDialingCode'].clearValidators();
        this.myProfileForm.controls['selectedCountryDialingCode'].updateValueAndValidity();
        this.showVerifyBtn = false;
      }

    }, 1000);
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
    console.log('parent', data);
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

