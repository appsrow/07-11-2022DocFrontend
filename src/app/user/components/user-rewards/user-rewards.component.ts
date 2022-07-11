import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UserService } from '../../services/user.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/shared/services/header.service';
import { CompleteTaskData, paypalRewardDataParameters, Rewards, RewardsDetail, RewardsRequestParameters } from '../../models/user-task.model';
import { UserCoinsData } from 'src/app/shared/models/shared.model';
import { RedeemRewardsParameters, RedeemRewardsRequestParameters } from '../../models/profile.model';
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Country, RequestSmsRequestData, RequestSmsResponseData, VerifyCodeRequestData } from '../../models/registration.model';
import { Config } from 'ng-otp-input/lib/models/config';
@Component({
  selector: 'app-user-rewards',
  templateUrl: './user-rewards.component.html',
  styleUrls: ['./user-rewards.component.scss']
})
export class UserRewardsComponent implements OnInit {
  selectionName: any;
  submitted: boolean = false;
  error: string = '';
  closeResult = '';
  closeModal: string;
  userRewardForm: FormGroup;
  paypalEmail: string;
  btnRedeemHistory: boolean = false;
  modalReference!: NgbModalRef;
  userAlreadyRedeemRewards: RedeemRewardsParameters[];
  userTotalRedeemRewards: number = 0;
  totalWalletBalance: number = 0;
  totalEarnCoins: number = 0;
  totalCoinsDetails: number;
  totalAvailableCoinsPaypal: number = 0;
  totalAmount: number;
  alreadyRedeemed: boolean = false;
  showLoadMoreButton: boolean = false;
  showAllRewards = 6;
  rewards: RewardsDetail[];
  userPhoneVerificationForm: FormGroup;
  submittedPhone: boolean = false;
  submittedPhoneCode: boolean = false;
  phoneNumber: string;
  modalReference2!: NgbModalRef;
  countriesDialingCodes: any;
  countriesDialingCodesSettings = {};
  verifyOtp: string;
  isVerifyButtonEnable: boolean = false;
  showOtpRequiredText: boolean = false;
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
    public userService: UserService,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public headerService: HeaderService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private formbuilder: FormBuilder) {
    this.userRewardForm = this.formBuilder.group(
      {
        paypalEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
      }
    );
  }

  async ngOnInit() {
    this.getTotalCoinsOfUser();
    this.getAllRewards();
    await this.getCountryDialingCodes();
    this.userPhoneVerificationForm = this.formbuilder.group({
      phone: ['', [Validators.required]],

      selectedCountryDialingCode: ['', [Validators.required]]
    });
    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    }
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
  async getTotalCoinsOfUser() {
    this.utilityService.showLoading();
    const response: UserCoinsData = await this.userService.getTotalCoinsOfUser();
    this.totalWalletBalance = response.data.wallet_balance;
    const responseRewards: RedeemRewardsRequestParameters = await this.userService.getAlreadyRedeemRewards();
    try {
      if (responseRewards.success) {
        this.utilityService.hideLoading();
        this.userAlreadyRedeemRewards = responseRewards.data;
        for (var i = 0; i < this.userAlreadyRedeemRewards.length; i++) {
          this.userAlreadyRedeemRewards[i].converted_transaction_date = moment(this.userAlreadyRedeemRewards[i].date).format('DD/MM/YYYY')
        }
        let total = 0;
        for (let data of this.userAlreadyRedeemRewards) {
          total += data.coins;
        }
        if (total > 0) {
          this.userTotalRedeemRewards = total;
          this.btnRedeemHistory = true;
        }
        else {
          this.userTotalRedeemRewards = 0;
        }
      }
      else {
        this.utilityService.hideLoading();
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
    this.totalEarnCoins = Number(this.userTotalRedeemRewards) + Number(this.totalWalletBalance);

  }

  async getUserRewardPaypal() {
    this.submitted = true;
    if (this.userRewardForm.invalid) {
      return;
    }
    else {
      this.utilityService.showLoading();
      try {
        const paypalRewardData: paypalRewardDataParameters = {
          rewards_id: '2',
          receiver: this.userRewardForm.controls.paypalEmail.value,
          value: '10'
        }

        const response: CompleteTaskData = await this.userService.getUserPaypalReward(paypalRewardData);
        if (response.success) {
          this.utilityService.hideLoading();
          this.utilityService.showSuccessToast('toast.rewardsPaypalPayment');
          this.utilityService.showInfoToast('toast.youHaveUsedCoins');
          this.router.navigate(['/user/userRewards']);
          this.getTotalCoinsOfUser();
          this.headerService.sendCoinUpdateEvent('task completed');
        } else {
          this.utilityService.hideLoading();
          this.utilityService.showErrorToast(response.message);
        }
      } catch (error: any) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast(error.message);
      }
    }
  }

  async openModel(content: any, mobilePopup?: any) {
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
        this.yourPhoneIsNotConfirmedModal(mobilePopup);
        return;
      }
    }
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }
  openConfirmModel(confirm: any) {
    this.submitted = true;
    if (this.userRewardForm.invalid) {
      return true;
    }
    else {
      this.paypalEmail = this.userRewardForm.controls.paypalEmail.value;
      this.modalReference.close();
      this.modalService.open(confirm, { centered: true, ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
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

  goToTwitch() {
    this.router.navigate(['/user/twitch']);
  }

  async getAlreadyReedeemRewards() {
    this.utilityService.showLoading();
    try {
      const response: RedeemRewardsRequestParameters = await this.userService.getAlreadyRedeemRewards();
      if (response.success) {
        this.utilityService.hideLoading();
        this.userAlreadyRedeemRewards = response.data;

        for (var i = 0; i < this.userAlreadyRedeemRewards.length; i++) {
          this.userAlreadyRedeemRewards[i].converted_transaction_date = moment(this.userAlreadyRedeemRewards[i].date).format('DD/MM/YYYY')
        }
        if (response.data.length > 0) {
          this.alreadyRedeemed = true;
          // if (this.userAlreadyRedeemRewards.length > 6) {
          //   this.showLoadMoreButton = true;
          // }

        }
        else {
          this.alreadyRedeemed = false;
        }
      }
      else {
        this.utilityService.hideLoading();
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }
  async showAllRedeemRewards() {
    this.getAlreadyReedeemRewards();
  }
  loadMoreReword() {
    this.showLoadMoreButton = false;
    this.showAllRewards = this.userAlreadyRedeemRewards.length;
  }

  async getAllRewards() {
    this.utilityService.showLoading();
    try {
      const updateData: RewardsRequestParameters = {
        user_id: this.authService.getLoggedInUserDetail().user_info.id
      }
      const response: Rewards = await this.userService.getRewards(updateData);
      this.totalCoinsDetails = response.data.rewards[1].minimum_coins;
      this.totalAmount = response.data.rewards[1].amount;

      setTimeout(() => {
        this.totalAvailableCoinsPaypal = Number(this.totalWalletBalance) - Number(this.totalCoinsDetails);
      }, 100);


      if (response.success) {
        this.utilityService.hideLoading();
        this.rewards = response.data.rewards;
      }
      else {
        this.utilityService.hideLoading();
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }

  goToGiftCards() {
    this.router.navigate(['/user/giftCards']);
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
        this.utilityService.showErrorToast('toast.FailedLogin');
      }
    }
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

  cancel() {
    this.modalReference.close();
  }

  async verifyCode(content: any) {
    this.submittedPhoneCode = true;
    if (!this.verifyOtp) {
      if (!this.verifyOtp) {
        this.showOtpRequiredText = true;
      }
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
        this.utilityService.showSuccessToast('toast.phoneNumVerified');
        this.modalReference.close();
        this.modalReference2.close();
        this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' });
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
      this.utilityService.showErrorToast('toast.FailedLogin');
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
}
