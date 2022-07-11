import { Component, ElementRef, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'ng-otp-input/lib/models/config';
import { RequestSmsRequestData, RequestSmsResponseData, VerifyCodeRequestData } from 'src/app/user/models/registration.model';
import { UserService } from 'src/app/user/services/user.service';
import { UtilityService } from '../services/utility.service';

@Component({
  selector: 'app-confirm-mobile-verification',
  templateUrl: './confirm-mobile-verification.component.html',
  styleUrls: ['./confirm-mobile-verification.component.scss']
})
export class ConfirmMobileVerificationComponent implements OnInit {

  @Output() parentFunction:EventEmitter<any> = new EventEmitter();
  modalReference!: NgbModalRef;
  @ViewChild("content") modalContent: TemplateRef<any>;
  isVerifyCodeRequested: boolean = false;
  verifyOtp: string;
  isVerifyButtonEnable: boolean = false;
  showOtpRequiredText: boolean = false;
  verificationSmsSent: boolean = false;
  userPhoneVerificationForm: FormGroup = new FormGroup({
    verifyCode1: new FormControl(['']),
    verifyCode2: new FormControl(['']),
    verifyCode3: new FormControl(['']),
    verifyCode4: new FormControl(['']),
    verifyCode5: new FormControl(['']),
    verifyCode6: new FormControl(['']),
  });
  config :Config = {
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
  closeModal: string;
  phoneNumberVerfied: string;
  

  constructor(private modalService: NgbModal,
    private elementRef: ElementRef,
    public utilityService: UtilityService,
    private userService: UserService) {
      //console.log('contructor', this.modalContent);
      
    }

    @Input() phone_number: string;
    @Input() country_dialing_code: string;

  ngOnInit(): void {
  }

  async requestCode(){
    try {
     this.utilityService.showLoading();
      const requestBody: RequestSmsRequestData = {
        'phone_number': this.phone_number,
        'country_dialing_code': this.country_dialing_code
      }
      const response: RequestSmsResponseData = await this.userService.requestVerificationCode(requestBody);
      if (response.success) {
        this.utilityService.hideLoading();
        this.verificationSmsSent = true;
        this.isVerifyCodeRequested = true;
        this.utilityService.showSuccessToast('toast.verificationSmsSent');
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

  openModal(){
   console.log('con', this.modalContent);
   console.log('phone num', this.phone_number);
   
   
    this.modalReference = this.modalService.open(this.modalContent, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  onOtpChange(event:any){
    if(event.length == 6){
      this.verifyOtp = event;
      this.isVerifyButtonEnable = true;
      this.showOtpRequiredText = false;
    }else{
      this.verifyOtp = '';
      this.isVerifyButtonEnable = false;
    }
  }

  skipVerification(){
    this.modalReference.close();
  }

  async verifyCode(){
    if(this.phoneNumberVerfied || !this.verifyOtp){
      if(!this.verifyOtp){
        this.showOtpRequiredText = true;
      }
      return;
    }
    
   // this.submittedPhone = true;
    if(!this.userPhoneVerificationForm.valid){
      return;
    }
    try {
      const requestBody: VerifyCodeRequestData = {
        'phone_number': this.phone_number,
        'code': this.verifyOtp,
        'country_dialing_code': this.country_dialing_code
      }
      
      const response: RequestSmsResponseData = await this.userService.checkVerificationCode(requestBody);
      
      if (response.success) {
        this.utilityService.showSuccessToast('toast.phoneNumVerified');
        
        let data = {'phoneNumberVerfied': this.phone_number, 'countriesDialingCodesSettings': 'disable'};
        this.parentFunction.emit(data);
        this.modalReference.close();
      }
      else {
        this.utilityService.showErrorToast(response.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }
  }


  private getDismissReason(reason: any): string {
    this.verificationSmsSent = false;
    this.phoneNumberVerfied = '';
    this.isVerifyCodeRequested = false;
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

}
