import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ModalDismissReasons, NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { HeaderService } from 'src/app/shared/services/header.service';
import { SearchStreamerRequestData, SearchStreamerResponse, StreamersInfo, TwitchPromotedStreamersListRequestData, TwitchPromotedStreamersListResponseData, TwitchSubscriptionRequestData, TwitchSubsriptionResponseData, UserProfileDataResponse } from '../../models/user-twitch.model';
import { UserCoinsData } from 'src/app/shared/models/shared.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Country, RequestSmsRequestData, RequestSmsResponseData, VerifyCodeRequestData } from '../../models/registration.model';
import { Config } from 'ng-otp-input/lib/models/config';

declare const gtag: Function;

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss']
})
export class TwitchComponent implements OnInit {
  modalContent: StreamersInfo;
  modalReference!: NgbModalRef;
  closeModal!: string;
  streamersData: StreamersInfo[];
  promotedStreamersdata: StreamersInfo[];
  keyword: any;
  search: string = '';
  profileData: any;
  countPromotersClick: number = 0;
  timeout: any = null;
  paginationCursor: string = '';
  totalPages: number;
  showLoadMorePromotedButton: boolean = true;
  errorMessage: string = '';
  totalCoins: number = 0;
  totalAvailableTwitchCoins: number;
  pauseTime: any;
  userPhoneVerificationForm: FormGroup;
  countriesDialingCodes: any;
  submittedPhone: boolean = false;
  phoneNumber: string;
  modalReference2!: NgbModalRef;
  submittedPhoneCode: boolean = false;
  verifyOtp: string;
  showOtpRequiredText: boolean = false;
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
  isVerifyButtonEnable: boolean = false;
  countriesDialingCodesSettings = {};
  constructor(
    config: NgbModalConfig,
    public userService: UserService,
    private modalService: NgbModal,
    public utilityService: UtilityService,
    public headerService: HeaderService,
    public router: Router,
    private formbuilder: FormBuilder
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  async ngOnInit() {
    this.getPromotedStreamersList();
    this.userPhoneVerificationForm = this.formbuilder.group({
      phone: ['', [Validators.required]],

      selectedCountryDialingCode: ['', [Validators.required]]
    });
    await this.getCountryDialingCodes();
    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    }
  }

  async triggerModal(content: any, streamersInfo: StreamersInfo) {
    this.modalContent = streamersInfo;
    // get total coins
    const responseCoins: UserCoinsData = await this.userService.getTotalCoinsOfUser();
    if (responseCoins.success) {
      this.totalCoins = responseCoins.data.wallet_balance;
    }
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  async openConfirmModel(confirm: any, mobileModalContent: any) {
    this.modalReference.close();
    // check if the phone is confirmed
    const response: any = await this.userService.getProfile();
    if (response.success) {
      if (response.data.user_info.is_phone_confirmed === 0) {
        if (response.data.user_info.phone) {
          this.userPhoneVerificationForm.controls.phone.setValue(response.data.user_info.phone);
        }
        if (response.data.user_info.country_dialing_code) {
          var countryDialingCodeResult = [];
          for (let countryDialingCode of this.countriesDialingCodes) {
            if (response.data.user_info.country_dialing_code === countryDialingCode.itemName) {
              countryDialingCodeResult.push({ id: countryDialingCode.id, itemName: countryDialingCode.itemName });
            }
          }
          this.userPhoneVerificationForm.controls.selectedCountryDialingCode.setValue(countryDialingCodeResult);
        }
        this.yourPhoneIsNotConfirmedModal(mobileModalContent);
        return;
      }
    }
    setTimeout(() => {
      if (this.modalContent.discounted_coins === 0) {
        this.totalAvailableTwitchCoins = Number(this.totalCoins) - Number(this.modalContent.coins);
      } else {
        this.totalAvailableTwitchCoins = Number(this.totalCoins) - Number(this.modalContent.discounted_coins);
      }
    }, 100);
    this.modalReference = this.modalService.open(confirm, { centered: true, ariaLabelledBy: 'modal-basic-title', size: 'lg' })
    this.modalReference.result.then((result) => {
      this.closeModal = `Closed with: ${result}`;
    }, (reason) => {
      this.closeModal = `Dismissed ${this.getDismissReason(reason)}`;
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

  async getPromotedStreamersList(isInitialLoaded?: boolean) {
    if (!isInitialLoaded) {
      this.countPromotersClick++;
    } else {
      this.countPromotersClick = 1;
    }

    try {
      this.utilityService.showLoading();
      const requestBody: TwitchPromotedStreamersListRequestData = { limit: 10, page: this.countPromotersClick };
      const response: TwitchPromotedStreamersListResponseData = await this.userService.getTwitchPromotedStreamersList(requestBody);
      if (response) {
        this.totalPages = response.data.totalPages;
        if (this.countPromotersClick === 1) {
          this.errorMessage = '';
          this.promotedStreamersdata = response.data.records;
        }
        if (this.countPromotersClick > 1) {
          response.data.records.forEach((streamResponse: any) => {
            this.streamersData.push(streamResponse);
          });
        } else {
          this.streamersData = response.data.records;
        }
        if (response.data.totalPages <= this.countPromotersClick) {
          this.showLoadMorePromotedButton = false;
          this.paginationCursor = '';
        }
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }
  }

  async searchUserProfileInfo() {
    let wordSearch = this.keyword;

    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(async () => {
      this.utilityService.showLoading();
      if ($this.keyword) {
        const response: UserProfileDataResponse = await $this.userService.getUserProfileData(wordSearch);

        if (response.success) {
          this.profileData = response.data;
          this.keyword = response.data.login;
          this.utilityService.hideLoading();
        } else {
          this.profileData = {};
          this.utilityService.hideLoading();
        }
      } else {
        this.utilityService.hideLoading();
        this.profileData = {};
      }
    }, 2000);
  }

  async searchStreamer() {
    let wordSearch = this.search;
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(async () => {
      if (this.search) {
        this.showLoadMorePromotedButton = false;
        const requestBody: SearchStreamerRequestData = { limit: 10, cursor: '', search: wordSearch };
        const response: SearchStreamerResponse = await this.userService.searchStreamer(requestBody);
        if (response.success) {
          this.errorMessage = '';
          this.streamersData = response.data.records;
          this.paginationCursor = response.data.pagination.cursor;
        } else {
          this.errorMessage = response.message;
          this.streamersData = [];
        }
      } else {
        this.getPromotedStreamersList(true);
        this.streamersData = this.promotedStreamersdata;
        this.showLoadMorePromotedButton = true;
      }
    }, 1000);
  }

  async twitchSubscription(twitchStreamerId: string) {
    const requestBody: TwitchSubscriptionRequestData = {
      user_twitch_id: this.keyword,
      streamer_twitch_id: twitchStreamerId,
      rewards_id: 1
    }
    try {
      this.utilityService.showLoading();
      const response: TwitchSubsriptionResponseData = await this.userService.twitchSubscribe(requestBody);

      if (response.success) {
        if (response.data.subscription_price) {
          gtag("event", "spend_virtual_currency", {
            value: response.data.subscription_price,
            virtual_currency_name: "coins",
            item_name: "Twitch subscription"
          });
        }

        this.modalReference.close();
        this.headerService.sendCoinUpdateEvent('task completed');
        this.utilityService.showSuccessToast('toast.twitchSubscription');
        this.utilityService.hideLoading();
      } else {
        this.utilityService.showErrorToast(response.message);
        this.utilityService.hideLoading();
        this.modalReference.close();
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  loadMoreSearchStreamer(cursor: string) {
    let wordSearch = this.search;
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(async () => {
      if (this.search) {
        this.utilityService.showLoading();
        const requestBody = { limit: 10, cursor: cursor, search: wordSearch };
        const response: any = await this.userService.searchStreamer(requestBody);
        if (response.success) {
          this.utilityService.hideLoading();
          this.paginationCursor = response.data.pagination.cursor;
          response.data.records.forEach((response: any) => {
            this.streamersData.push(response);
          });
        } else {
          this.utilityService.hideLoading();
          this.streamersData = this.promotedStreamersdata;
        }
      } else {
        this.utilityService.hideLoading();
        this.streamersData = this.promotedStreamersdata;
      }
    }, 1000);
  }

  goToPrivacy(policy: string) {
    if (window.localStorage.getItem('selectedLanguage') === 'es') {
      const link = this.router.serializeUrl(this.router.createUrlTree(['policies-es'], { queryParams: { policies: policy } }));
      window.open(link, '_blank');
    } else {
      const link = this.router.serializeUrl(this.router.createUrlTree(['policies'], { queryParams: { policies: policy } }));
      window.open(link, '_blank');
    }
  }

  yourPhoneIsNotConfirmedModal(content: any) {
    //  this.modalContent = task;
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });

    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  async getCountryDialingCodes() {
    try {
      this.utilityService.showLoading();
      const response: Country = await this.userService.getCountries();
      if (response.success) {
        this.countriesDialingCodes = response.data;

        const newArray = this.countriesDialingCodes.map((item: any) => {
          return { id: item.id, itemName: item.dialing_code + ' ' + '(' + item.country_name + ')' };
        });
        this.countriesDialingCodes = newArray;
        console.log('countriesDialingCodes', this.countriesDialingCodes);

      }
      this.utilityService.hideLoading();
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCountryList');
      this.utilityService.hideLoading();
    }
  }

  async sendVerificationCode(content: any) {
    this.submittedPhone = true;
    if (this.userPhoneVerificationForm.invalid) {
      return true;
    }
    else {
      try {
        this.utilityService.showLoading();
        const requestBody: RequestSmsRequestData = {
          'phone_number': this.userPhoneVerificationForm.value.phone,
          'country_dialing_code': this.userPhoneVerificationForm.value.selectedCountryDialingCode[0].itemName
        }
        const response: RequestSmsResponseData = await this.userService.requestVerificationCode(requestBody);
        if (response.success) {
          this.utilityService.hideLoading();
          this.phoneNumber = this.userPhoneVerificationForm.value.selectedCountryDialingCode[0].itemName + this.userPhoneVerificationForm.value.phone;
          this.utilityService.showSuccessToast('toast.verificationSmsSent');
          this.modalReference.close();
          this.modalReference2 = this.modalService.open(content, { backdropClass: 'light-blue-backdrop', size: 'md' });
          this.modalReference2.result.then((res) => {
            this.closeModal = `Closed with: ${res}`;
          },
            (res) => {
              this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
            });
        }
        else {
          this.utilityService.hideLoading();
          this.utilityService.showErrorToast(response.message);
        }
      }
      catch (error) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast('toast.somethingWentWrong');
      }
    }
  }

  async verifyCode(content: any) {

    // if(this.phoneNumberVerfied){
    //   return;
    // }
    this.submittedPhoneCode = true;
    if (!this.verifyOtp) {
      this.showOtpRequiredText = true;
      return;
    }
    try {
      this.utilityService.showLoading();
      const requestBody: VerifyCodeRequestData = {
        'phone_number': this.userPhoneVerificationForm.value.phone,
        'code': this.verifyOtp,
        'country_dialing_code': this.userPhoneVerificationForm.value.selectedCountryDialingCode[0].itemName
      }

      const response: RequestSmsResponseData = await this.userService.checkVerificationCode(requestBody);

      if (response.success) {
        this.utilityService.hideLoading();
        //this.phoneNumberVerfied = true;
        this.utilityService.showSuccessToast('toast.phoneNumVerified');
        this.modalReference.close();
        this.modalReference2.close();
        this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
        this.modalReference.result.then((res) => {
          this.closeModal = `Closed with: ${res}`;
        },
          (res) => {
            this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
          });
      }
      else {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast(response.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
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

  cancel() {
    this.modalReference.close();
  }

  async triggerTwitchContentModal(content: any) {
    this.modalReference.close();
    //  this.modalContent = streamersInfo;
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }
}
