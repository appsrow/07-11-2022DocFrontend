import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';
import { campaignInformation, CampaignTargetInfo } from '../../models/campaign.model';
import { QuestionsFormComponent } from '../questions-form/questions-form.component';
import { BrandService } from '../../services/brand.service';
import { CampaignPreviewComponent } from '../campaign-preview/campaign-preview.component';
import { CampaignTargetComponent } from '../campaign-target/campaign-target.component';
import { CreateCampaignComponent } from '../create-campaign/create-campaign.component';
import { JsonPipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-campaign-create-tabs',
  templateUrl: './campaign-create-tabs.component.html',
  styleUrls: ['./campaign-create-tabs.component.scss']
})
export class CampaignCreateTabsComponent implements OnInit {

  selectedTab: string = 'campaignTarget';
  paymentType: any;
  isPaymentTypeBankTransfer: boolean = false;
  target: CampaignTargetInfo = { id: '', name: '', apiCampaignName: '', campaignDisplayName: '', icon: '', socialLink: '' };
  campaignInformation: campaignInformation = {
    campaign_name: '', goal_of_campaign: '', start_date: '',
    end_date: '', product_information: '', campaign_type: '', campaign_type_name: '', user_id: 0,
    campaign_image: '', sub_total: 0, tax_value: '', country: '', start_age: 0, end_age: 0, gender: '',
    cac: 0, total_budget: 0, coins: 0, user_target: 0, campaign_position: 0, uploaded_video_url: '',
    selected_social_media_name: '', selected_social_media_url: '', app_download_link: '',
    website_url: ''
  };
  questionsFormData: any;

  @ViewChild('campaignTargetComponent') campaignTargetComponent!: CampaignTargetComponent;
  @ViewChild('createCampaignComponent') createCampaignComponent!: CreateCampaignComponent;
  @ViewChild('campaignPreviewComponent') campaignPreviewComponent!: CampaignPreviewComponent;
  @ViewChild('questionsFormComponent') questionsFormComponent!: QuestionsFormComponent;

  // Variables for paypal payment
  myWindow: any;
  isPreview: boolean = false;
  @ViewChild('paypal', { static: true }) paypalElement?: ElementRef;
  @ViewChild('paypalRef', { static: true }) paypalRef?: ElementRef;
  rows: any = [];
  questionDetails: any;
  IsfromPreviousTab: boolean = false;

  // showPaypalButton: boolean = false;
  constructor(private brandService: BrandService,
    private utilityService: UtilityService,
    private router: Router,
    private formBuilder: FormBuilder) {
    this.myWindow = window;
    this.paymentType = this.utilityService.getClickEvent().subscribe(() => {
      this.bankTransferSelected();
    })
  }

  ngOnInit(): void { }

  navigateNext() {
    this.IsfromPreviousTab = false;
    if (this.selectedTab === 'campaignTarget') {
      this.removePaypalButton();
      this.selectedTab = 'createCampaign';
      this.target = this.campaignTargetComponent.selectedTarget;
    } else if (this.selectedTab === 'createCampaign') {
      this.campaignInformation = this.createCampaignComponent?.campaignInformation;
      if (this.campaignInformation?.campaign_type === 'questions_form' && this.createCampaignComponent.createCampaignForm.valid) {
        this.selectedTab = 'questionsFormComponent';

        setTimeout(() => {
          if (this.questionsFormData) {
            this.questionsFormComponent?.questionsForm.patchValue({
              formName: this.questionsFormData.formName,
              formDescription: this.questionsFormData.formDescription,
            });
            this.questionsFormData.rows.forEach(async (row: any) => {
              await this.questionsFormComponent.FormFill(row)
            });
          }
        }, 200);
      }
      else {
        this.removePaypalButton();
        this.createCampaignComponent.submitted = true;
        if (this.createCampaignComponent.createCampaignForm.valid) {
          this.selectedTab = 'campaignPreview';
          this.isPreview = false;
        }
      }
    } else if (this.selectedTab === 'questionsFormComponent') {
      this.questionsFormData = this.questionsFormComponent.questionsForm.value;
      this.removePaypalButton();
      this.questionsFormComponent.submitted = true;
      var a = this.questionsFormComponent.questionsForm;
      if (this.questionsFormComponent?.questionsForm.valid) {
        this.selectedTab = 'campaignPreview';
        this.isPreview = false;
      }
    }
    if (this.selectedTab === 'campaignPreview') {
      if (this.questionsFormComponent) {
        this.questionsFormComponent.submitted = true;
      }
      setTimeout(() => {
        this.isPreview = true;
        if (this.campaignPreviewComponent.isPreviewLoaded === true) {
          this.paymentType = this.campaignPreviewComponent.paymentType;
          this.paypalFun(this.campaignPreviewComponent.amountPay, this.campaignPreviewComponent.cac, this.campaignPreviewComponent.totalBudget);
        }
      }, 1000);
    }
    window.scrollTo(0, 0);
  }

  showPaypalButton() {
    if (this.selectedTab === 'campaignPreview') {
      setTimeout(() => {
        this.isPreview = true;
        this.paymentType = this.campaignPreviewComponent.paymentType;
        this.paypalFun(this.campaignPreviewComponent.amountPay, this.campaignPreviewComponent.cac, this.campaignPreviewComponent.totalBudget);
      }, 1000);

    }
  }

  navigatePrevious() {
    this.IsfromPreviousTab = true;
    if (this.selectedTab === 'createCampaign') {
      this.removePaypalButton();
      this.selectedTab = 'campaignTarget';
    } if (this.selectedTab === 'campaignPreview') {
      // check if its question campaign If yes redirect it to the questions page
      if (this.campaignTargetComponent?.selectedTarget?.apiCampaignName === 'questions_form') {
        this.removePaypalButton();
        this.selectedTab = 'questionsFormComponent';
        this.IsfromPreviousTab = true;
        setTimeout(() => {
          this.questionsFormComponent?.questionsForm.patchValue({
            formName: this.questionsFormData.formName,
            formDescription: this.questionsFormData.formDescription,
          });

          // let rowLength = this.questionsFormData.rows.length;
          // console.log('rowLength', rowLength);

          // if (rowLength === 1) {
          //   this.questionsFormComponent.FormFill(this.questionsFormData.rows[0])
          // } else {
          // If there are multiple rows
          this.questionsFormData.rows.forEach(async (row: any) => {
            await this.questionsFormComponent.FormFill(row)
          });
          //}
        }, 200);


        return;
      }
      this.selectedTab = 'createCampaign';

      this.removePaypalButton();
      setTimeout(() => {
        if (this.campaignInformation.country) {
          let countryVals = this.campaignInformation.country.split(',');
          var countryResult = [];
          for (let country of this.createCampaignComponent.countries) {
            for (let countryId of countryVals) {
              if (country.id === parseInt(countryId)) {
                countryResult.push({ id: country.id, itemName: country.itemName });
              }
            }
          }
        }

        let genderVals = this.campaignInformation.gender;
        if (genderVals) {
          var genderResult = this.createCampaignComponent.genderList.filter((genderListItem: any) => genderVals.includes(genderListItem.id));
        }

        if (this.campaignInformation.selected_social_media_name) {
          this.createCampaignComponent.getSocialMedia(this.campaignInformation.selected_social_media_name);
          this.createCampaignComponent.removeCacValidationOnPrevious(this.campaignInformation.selected_social_media_name);
        }

        this.createCampaignComponent.createCampaignForm.patchValue({
          campaignName: this.campaignInformation.campaign_name,
          goalOfCampaign: this.campaignInformation.goal_of_campaign,
          startDate: new Date(this.campaignInformation.start_date),
          endDate: new Date(this.campaignInformation.end_date),
          productInformation: this.campaignInformation.product_information,
          CAC: this.campaignInformation.cac,
          usersTarget: this.campaignInformation.user_target,
          totalBudget: this.campaignInformation.sub_total,
          coins: this.campaignInformation.coins,
          totalAmount: this.campaignInformation.total_budget,
          downloadLink: this.campaignInformation.app_download_link,
          socialMedia: this.campaignInformation.selected_social_media_name,
          websitelink: this.campaignInformation.website_url,
          sociallink: this.campaignInformation.selected_social_media_url,
          //user_id: this.authService.getAccessToken().user_info.id,
          campaignImage: this.campaignInformation.campaign_image,
          videoUpload: this.campaignInformation.uploaded_video_url,
          fromAge: this.campaignInformation.start_age,
          toAge: this.campaignInformation.end_age,
          selectedCountries: countryResult,
          selectedGenders: genderResult,
          campaignPosition: this.campaignInformation.campaign_position,
        });
      }, 1000);
    }
    else if (this.selectedTab === 'questionsFormComponent') {
      this.removePaypalButton();
      this.selectedTab = 'createCampaign';
      setTimeout(() => {
        if (this.campaignInformation && this.createCampaignComponent) {
          if (this.campaignInformation.country) {
            let countryVals = this.campaignInformation.country.split(',');
            var countryResult = [];

            if (this.createCampaignComponent.countries) {
              for (let country of this.createCampaignComponent.countries) {
                for (let countryId of countryVals) {
                  if (country.id === parseInt(countryId)) {
                    countryResult.push({ id: country.id, itemName: country.itemName });
                  }
                }
              }
            }
          }

          let genderVals = this.campaignInformation.gender;
          if (genderVals) {
            var genderResult = this.createCampaignComponent.genderList.filter((genderListItem: any) => genderVals.includes(genderListItem.id));
          }

          if (this.campaignInformation.selected_social_media_name) {
            this.createCampaignComponent.getSocialMedia(this.campaignInformation.selected_social_media_name);
            this.createCampaignComponent.removeCacValidationOnPrevious(this.campaignInformation.selected_social_media_name);
          }

          this.createCampaignComponent.createCampaignForm.patchValue({
            campaignName: this.campaignInformation.campaign_name,
            goalOfCampaign: this.campaignInformation.goal_of_campaign,
            startDate: new Date(this.campaignInformation.start_date),
            endDate: new Date(this.campaignInformation.end_date),
            productInformation: this.campaignInformation.product_information,
            CAC: this.campaignInformation.cac,
            usersTarget: this.campaignInformation.user_target,
            totalBudget: this.campaignInformation.sub_total,
            coins: this.campaignInformation.coins,
            totalAmount: this.campaignInformation.total_budget,
            downloadLink: this.campaignInformation.app_download_link,
            socialMedia: this.campaignInformation.selected_social_media_name,
            websitelink: this.campaignInformation.website_url,
            sociallink: this.campaignInformation.selected_social_media_url,
            //user_id: this.authService.getAccessToken().user_info.id,
            campaignImage: this.campaignInformation.campaign_image,
            videoUpload: this.campaignInformation.uploaded_video_url,
            fromAge: this.campaignInformation.start_age,
            toAge: this.campaignInformation.end_age,
            selectedCountries: countryResult,
            selectedGenders: genderResult,
            campaignPosition: this.campaignInformation.campaign_position,
          });
        }
      }, 1000);
    }
    window.scrollTo(0, 0);
  }

  paypalFun(amount: number, cac: number, subTotal?: string) {
    let self = this;

    if (this.selectedTab === 'campaignPreview') {
      // paypal
      this.myWindow.paypal.Buttons({
        style: {
          layout: 'horizontal',
          size: 'responsive',
          color: 'gold',
          shape: 'pill',
          label: 'pay',
          tagline: 'false'
        },

        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount,
                currency_code: 'EUR'
              }
            }]
          })
        },

        onApprove: (data: any, actions: any) => {
          // This function captures the funds from the transaction.
          return actions.order.capture().then((details: any) => {
            this.campaignPreviewComponent.brandCreateCampaign('paymentSuccess').then(() => {
              this.capturePaymentDetails(details, cac, subTotal);
            });
          });
        },

        // Show an error page here, when an error occurs
        onError: function (err: any) {
          self.callPreviewMethod();
        },

        onCancel: function (data: any, actions: any) {
          self.callPreviewMethod();
        }

      }).render(this.paypalRef?.nativeElement);
      // paypal code over
    } else {
      this.myWindow.paypal.Buttons({
      }).hide();
    }
  }

  callPreviewMethod() {
    this.campaignPreviewComponent.brandCreateCampaign('noPayment');
  }

  removePaypalButton() {
    if (this.paypalRef?.nativeElement.childNodes.length === 1) {
      this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
    }
  }

  async capturePaymentDetails(details: any, cac: number, subTotal?: string) {
    let campaignId = this.campaignPreviewComponent.newlyCreatedCampaignId;
    const paymentDetails = details;
    paymentDetails.campaign_id = campaignId;
    //details.purchase_units
    paymentDetails.campaing_status = 'APPROVED';
    paymentDetails.transaction_date = moment(details.create_time).format('YYYY-MM-DD');
    paymentDetails.transaction_id = details.purchase_units ? details.purchase_units[0].payments.captures[0].id : '';
    paymentDetails.transaction_type = details.purchase_units ? 'paypal' : 'BANK_TANSFER';
    paymentDetails.transaction_status = details.status ? details.status : 'COMPLETED';
    paymentDetails.paypal_id = details.purchase_units ? details.purchase_units[0].payee.email_address : '';
    paymentDetails.paypal_reference_number = details.purchase_units ? details.purchase_units[0].payee.merchant_id : '';
    paymentDetails.grand_total = this.campaignInformation ? this.campaignInformation.sub_total : subTotal;
    paymentDetails.cac = cac;
    paymentDetails.tax_percentage = environment.taxPercentage;

    try {
      const response: any = await this.brandService.paypalBrandPayment(paymentDetails);
      if (response.success) {
        this.router.navigate(['brand/paymentSuccess']);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedCreateCampaign');
    }
  }

  public bankTransferSelected() {
    setTimeout(() => {
      if (this.campaignPreviewComponent) {
        if (this.campaignPreviewComponent.paymentType === 'Paypal') {
          this.isPaymentTypeBankTransfer = false;
          this.showPaypalButton();
        }

        if (this.campaignPreviewComponent.paymentType === 'Bank Transfer') {
          this.isPaymentTypeBankTransfer = true;
          this.removePaypalButton();
        }
      }
    }, 200);
  }

  bankTransferPayment() {
    this.campaignPreviewComponent.brandCreateCampaign('bankTransfer').then(() => {
      setTimeout(() => {
        this.capturePaymentDetails({}, this.campaignPreviewComponent.cac, this.campaignPreviewComponent.totalBudget);
      }, 1200);
    });
  }

}
