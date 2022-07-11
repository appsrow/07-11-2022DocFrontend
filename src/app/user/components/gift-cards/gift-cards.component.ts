import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserCoinsData } from 'src/app/shared/models/shared.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Rewards, RewardsRequestParameters } from '../../models/user-task.model';
import { UserService } from '../../services/user.service';
import { HeaderService } from 'src/app/shared/services/header.service';

@Component({
  selector: 'app-gift-cards',
  templateUrl: './gift-cards.component.html',
  styleUrls: ['./gift-cards.component.scss']
})
export class GiftCardsComponent implements OnInit {

  closeResult = '';
  giftCardInfo: any ;
  modalContent: any;
  agree: boolean = false;
  modalReference!: NgbModalRef;
  modalTwoReference!: NgbModalRef;
  isFBIframeLoaded: boolean = false;
  closeModal!: string;
  userEmail: string;
  giftCardRewardForm: FormGroup;
  submitted: boolean = false;
  cardInformation: any;
  giftCards: any = [];
  totalCoins: number = 0;
  totalAvailableGiftCardCoins: number;
  outOfStock: boolean = false;
  constructor(public utilityService : UtilityService,
    public userService: UserService,
    private modalService: NgbModal,
    public router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public headerService: HeaderService) {
      this.giftCardRewardForm = this.formBuilder.group(
        {
          userEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
        }
      );
    }

  ngOnInit(): void {
    this.getUserCoinBalance();
    this.getAllGiftCardTypes();
  }

  async getAllGiftCardTypes(){
    try{
      this.utilityService.showLoading();
      const response: any = await this.userService.getAllGiftCardsType();

      if(response.success){
        this.utilityService.hideLoading();
        this.giftCardInfo = response.data;
      }else{
        this.giftCardInfo = [];
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast(response.message);
      }
    }
    catch (error){
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }
  }

  async openModel(content: any, giftCardDetail: any) {
    this.modalContent = giftCardDetail;

    // get the gift cards according to card type.
    try{
      this.utilityService.showLoading();
      const cardName = {
        "gift_card_type" : this.modalContent.card_name
      }

      const res: any = await this.userService.getGiftCardTypes(cardName);

      if(res.success){
        this.utilityService.hideLoading();
        this.giftCards = res.data;
        if(res.message === "Out of stock"){
          this.outOfStock = true;
        }else{
          this.outOfStock = false;
        }
      }else{
        this.utilityService.hideLoading();
      }
    }
    catch(error){
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }

    
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  private getDismissReason(reason: any): string {
    this.cardInformation = null;
    this.isFBIframeLoaded = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  close() {
    this.agree=false;
  }

  openConfirmModel(confirm: any) {
    this.submitted = true;
    if (this.giftCardRewardForm.invalid) {
      return true;
    }
    else {
      this.userEmail = this.giftCardRewardForm.controls.userEmail.value;
      this.modalReference.close();
      this.modalReference = this.modalService.open(confirm, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' });
      this.modalReference.result.then((res) => {
        this.closeModal = `Closed with: ${res}`;
      },
        (res) => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        });
    }
  }

  goToPrivacy(policy: string) {
    if (window.localStorage.getItem('selectedLanguage') === 'es') {
      const link = this.router.serializeUrl(this.router.createUrlTree(['policies-es'], { queryParams: { policies: policy }}));
      window.open(link, '_blank');
    } else {
      const link = this.router.serializeUrl(this.router.createUrlTree(['policies'], { queryParams: { policies: policy }}));
      window.open(link, '_blank');
    }
  }

  async selectCard(cardInfo: any){
    if(cardInfo.price > Number(this.totalCoins) || this.outOfStock){
      return false;
    }else{
      this.cardInformation = cardInfo;
      this.totalAvailableGiftCardCoins =  Number(this.totalCoins) - Number(this.cardInformation.price);
    }
  }

  async redeemGiftCard(id: number){
    try{
      this.utilityService.showLoading();
      const redeemParams = {
        'gift_card_id': id,
        'user_email': this.userEmail
      }

      const res:any = await this.userService.redeemGiftCard(redeemParams);

      if(res.success){
        this.utilityService.hideLoading();
        this.modalReference.close();
        this.utilityService.showSuccessToast('Congratulations! You have received a gift card on your email. Please check your inbox.');
        this.headerService.sendCoinUpdateEvent('task completed');
        this.router.navigate(['user/userRewards']);
      }else{
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast(res.message);
      }
    }
    catch(error){
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }
  }

  async getUserCoinBalance(){
     // get total coins
     const responseCoins: UserCoinsData = await this.userService.getTotalCoinsOfUser();
     if (responseCoins.success) {
       this.totalCoins = responseCoins.data.wallet_balance;
     } 
  }
}
