import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { BrandService } from '../../services/brand.service';
import * as moment from 'moment';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Country } from 'src/app/user/models/registration.model';
import { UserService } from 'src/app/user/services/user.service';
import { CreateAppsDownloadCampaignRequestParameters, createCampaignResponseParameters, CreateClicksOnWebsiteCampaignRequestParameters, CreateFollowCampaignRequestParameters, CreateLeadCampaignRequestParameters, CreateVideoCampaignRequestParameters } from '../../models/campaign.model';

import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { CampaignCreateTabsComponent } from '../campaign-create-tabs/campaign-create-tabs.component';
import { HeaderService } from 'src/app/shared/services/header.service';
@Component({
  selector: 'app-campaign-preview',
  templateUrl: './campaign-preview.component.html',
  styleUrls: ['./campaign-preview.component.scss']
})
export class CampaignPreviewComponent implements OnInit {

  cac: any;
  totalBudget: string;
  amountPay: any;
  campaignName: string;
  productInformation: string;
  startingDate: string;
  endingDate: string;
  goalOfTheCampaign: string;
  downloadLink: string;
  taxPercentage: string;
  error: string;
  campaignId: number;
  campaignImage: string;
  taxAmount: string;
  selectedSocialMediaName: string;
  videoUrl: string;
  socialMediaUrl: string;
  websiteUrl: string;
  startAge: string;
  endAge: string;
  countryIds: string[] = [];
  genderIds: string;
  countries: any;
  countryNames: string = '';
  genderNames: string;
  genderList: any[] = [{ id: 0, itemName: '' }];
  campaignType: string
  coins: number = 0;
  usersTarget: number = 0;
  newlyCreatedCampaignId: any;
  modalContent: any;
  modalReference!: NgbModalRef;
  closeModal!: string;
  isPreviewLoaded: boolean = false;
  isSelectedModePaypal: boolean = true;
  paymentType: string = 'Paypal';
  youtube_video_url: string;
  questionsLoop: any[] = [];

  // Variables for paypal payment
  // myWindow: any;
  @ViewChild('paypal', { static: true }) paypalElement?: ElementRef;
  @ViewChild('paypalRef', { static: true }) paypalRef?: ElementRef;
  @Input() campaignInfo: any;
  @Input() questionsFormData: any;

  /* 1. Some required variables which will be used by YT API*/
  public YT: any;
  public video: any;
  public player: any;
  public reframed: Boolean = false;
  myWindow: any = window;

  constructor(private brandService: BrandService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    public utilityService: UtilityService,
    private userService: UserService,
    private headerService: HeaderService,
    private modalPopupService: NgbModal) {
    this.myWindow = window;
  }

  async ngOnInit() {
    await this.getCountries();
    await this.getMyCampaignPreview();
  }

  ngAfterViewInit() {
    this.isPreviewLoaded = true;
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

  async getMyCampaignPreview() {
    let campData = this.campaignInfo;
    //console.log('campData', campData);

    // let questionsFormData = this.questionsFormDataP;
    // console.log('questionsFormData', questionsFormData);


    this.cac = parseFloat(campData.cac.toString()).toFixed(2),
      this.totalBudget = parseFloat(campData.sub_total.toString()).toFixed(2),
      this.campaignName = campData.campaign_name
    this.productInformation = campData.product_information
    this.startingDate = campData.start_date
    this.endingDate = campData.end_date
    this.goalOfTheCampaign = campData.goal_of_campaign
    this.downloadLink = campData.app_download_link
    this.campaignImage = campData.campaign_image,
      this.taxPercentage = campData.tax_value
    this.taxAmount = parseFloat(((campData.sub_total * campData.tax_value) / 100).toString()).toFixed(2),
      this.selectedSocialMediaName = campData.selected_social_media_name,
      this.videoUrl = campData.uploaded_video_url,
      this.socialMediaUrl = campData.selected_social_media_url,
      this.websiteUrl = campData.website_url,
      this.startAge = campData.start_age,
      this.endAge = campData.end_age,
      this.amountPay = (parseFloat(this.totalBudget) + parseFloat(this.taxAmount)).toFixed(2),
      this.countryIds = (campData.country) ? campData.country.split(',') : '',
      this.genderIds = (campData.gender) ? campData.gender.split(',') : '';
    this.campaignType = campData.campaign_type,
      this.coins = campData.coins
    let usersTarget = campData.total_budget / campData.cac;
    let usersTargetRoundDownTo = Math.floor(usersTarget);
    let usersTargetValidatate = this.utilityService.isNumeric(usersTargetRoundDownTo);
    this.youtube_video_url = campData.youtube_video_url

    this.usersTarget = 0;
    if (usersTargetValidatate) {
      this.usersTarget = usersTargetRoundDownTo;
    }
    this.genderList = [
      { "id": 1, "itemName": "Male" },
      { "id": 2, "itemName": "Female" },
      { "id": 3, "itemName": "Other" }
    ];

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
      this.genderNames = '';
      if (this.genderIds) {
        for (let gender of this.genderList) {
          for (let genderId of this.genderIds) {
            if (gender.id == parseInt(genderId)) {
              this.genderNames = this.genderNames + gender.itemName + ',';
            }
          }
        }
        this.genderNames = this.genderNames.substring(0, this.genderNames.length - 1);
      }
    });

    if (this.countryIds) {
      for (let country of this.countries) {
        for (let countryId of this.countryIds) {
          if (country.id === parseInt(countryId)) {
            this.countryNames = this.countryNames + country.itemName + ',';
          }
        }
      }
      this.countryNames = this.countryNames.substring(0, this.countryNames.length - 1);
    }
  }

  async brandCreateCampaign(paymentStatus: string) {
    // To fetch country id 
    var countryVals = [];
    let countryValues: any;
    if (this.countryIds) {
      for (var item of this.countryIds) {
        countryVals.push(item);
      }
      countryValues = countryVals.toString();
    }

    // To fetch gender id 
    var genderVals = [];
    let genderValues: any;
    if (this.genderIds) {
      for (var item of this.genderIds) {
        genderVals.push(item);
      }
      genderValues = genderVals.toString();
    }

    if (this.campaignType == 'lead_target') {
      const campaignData: CreateLeadCampaignRequestParameters = {
        "campaign_name": this.campaignName,
        "goal_of_campaign": this.goalOfTheCampaign,
        "start_date": moment(this.startingDate).format('YYYY-MM-DD'),
        "end_date": moment(this.endingDate).format('YYYY-MM-DD'),
        "product_information": this.productInformation,
        "cac": this.cac,
        "coins": this.coins,
        "user_target": this.usersTarget,
        "campaign_type": "lead_target",
        "campaign_type_name": 'Lead',
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.campaignImage,
        "sub_total": this.totalBudget,
        "tax_value": this.taxPercentage,
        "total_budget": this.amountPay,
        "country": countryValues,
        "start_age": this.startAge,
        "end_age": this.endAge,
        "gender": genderValues
      }

      this.utilityService.showLoading();
      try {
        const response: createCampaignResponseParameters = await this.brandService.createCampaignForLead(campaignData);

        if (response.success) {
          this.utilityService.hideLoading();
          if (paymentStatus === 'paymentSuccess' || paymentStatus === 'bankTransfer') {
            this.newlyCreatedCampaignId = response.data.id;
            this.utilityService.showSuccessToast('toast.leadCampaignCreate');
            this.router.navigate(['brand/paymentSuccess']);
          } else {
            this.utilityService.showSuccessToast('toast.leadCampaignUpdatePaymentPending');
            this.router.navigate(['brand/myCampaign']);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedCreateLeadCampaign');
        this.utilityService.hideLoading();
      }
    }


    //Type video upload
    if (this.campaignType == 'video_plays') {
      const campaignData: CreateVideoCampaignRequestParameters = {
        "uploaded_video_url": this.videoUrl,
        "campaign_name": this.campaignName,
        "goal_of_campaign": this.goalOfTheCampaign,
        "start_date": moment(this.startingDate).format('YYYY-MM-DD'),
        "end_date": moment(this.endingDate).format('YYYY-MM-DD'),
        "product_information": this.productInformation,
        "cac": this.cac,
        "coins": this.coins,
        "user_target": this.usersTarget,
        "campaign_type": "video_plays",
        "campaign_type_name": 'uploadvideo',
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.campaignImage,
        "sub_total": this.totalBudget,
        "tax_value": this.taxPercentage,
        "total_budget": this.taxAmount,
        "country": countryValues,
        "start_age": this.startAge,
        "end_age": this.endAge,
        "gender": genderValues,
        "youtube_video_url": this.youtube_video_url
      }

      this.utilityService.showLoading();
      try {
        const response: createCampaignResponseParameters = await this.brandService.createCampaignForVideoPlays(campaignData);
        if (response.success) {
          this.utilityService.hideLoading();
          if (paymentStatus === 'paymentSuccess' || paymentStatus === 'bankTransfer') {
            this.newlyCreatedCampaignId = response.data.id;
            this.utilityService.showSuccessToast('toast.videoCampaignCreated');
            this.router.navigate(['brand/paymentSuccess']);
          } else {
            this.utilityService.showSuccessToast('toast.videoCampaignCreatedPaymentPending');
            this.router.navigate(['brand/myCampaign']);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedVideoCampaignCreate');
        this.utilityService.hideLoading();
      }
    }

    // Type Follow
    if (this.campaignType == 'follow') {
      const campaignData: CreateFollowCampaignRequestParameters = {
        "campaign_name": this.campaignName,
        "goal_of_campaign": this.goalOfTheCampaign,
        "start_date": moment(this.startingDate).format('YYYY-MM-DD'),
        "end_date": moment(this.endingDate).format('YYYY-MM-DD'),
        "product_information": this.productInformation,
        "cac": this.cac,
        "coins": this.coins,
        "user_target": this.usersTarget,
        "campaign_type": "follow",
        "campaign_type_name": 'Follow',
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.campaignImage,
        "sub_total": this.totalBudget,
        "tax_value": this.taxPercentage,
        "total_budget": this.taxAmount,
        "country": countryValues,
        "start_age": this.startAge,
        "end_age": this.endAge,
        "gender": genderValues,
        "selected_social_media_name": this.selectedSocialMediaName,
        "selected_social_media_url": this.socialMediaUrl,
      }

      this.utilityService.showLoading();
      try {
        const response: createCampaignResponseParameters = await this.brandService.createCampaignForFollow(campaignData);
        if (response.success) {
          this.utilityService.hideLoading();
          if (paymentStatus === 'paymentSuccess' || paymentStatus === 'bankTransfer') {
            this.newlyCreatedCampaignId = response.data.id;
            this.utilityService.showSuccessToast('toast.followCampaignCreated');
            this.router.navigate(['brand/paymentSuccess']);
          } else {
            this.utilityService.showSuccessToast('toast.followCampaignCreatePaymentPending');
            this.router.navigate(['brand/myCampaign']);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedCreateFollowCampiagn');
        this.utilityService.hideLoading();
      }
    }

    // Apps download
    if (this.campaignType == 'apps_download') {
      const campaignData: CreateAppsDownloadCampaignRequestParameters = {
        "campaign_name": this.campaignName,
        "goal_of_campaign": this.goalOfTheCampaign,
        "start_date": moment(this.startingDate).format('YYYY-MM-DD'),
        "end_date": moment(this.endingDate).format('YYYY-MM-DD'),
        "product_information": this.productInformation,
        "cac": this.cac,
        "coins": this.coins,
        "user_target": this.usersTarget,
        "campaign_type": "apps_download",
        "campaign_type_name": 'Appsdownload',
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.campaignImage,
        "sub_total": this.totalBudget,
        "tax_value": this.taxPercentage,
        "total_budget": this.taxAmount,
        "country": countryValues,
        "start_age": this.startAge,
        "end_age": this.endAge,
        "gender": genderValues,
        "app_download_link": this.downloadLink
      }

      this.utilityService.showLoading();
      try {
        const response: createCampaignResponseParameters = await this.brandService.createCampaignForAppsdownload(campaignData);
        if (response.success) {
          this.utilityService.hideLoading();
          if (paymentStatus === 'paymentSuccess' || paymentStatus === 'bankTransfer') {
            this.newlyCreatedCampaignId = response.data.id;
            this.utilityService.showSuccessToast('toast.downloadCampaignCreated');
            this.router.navigate(['brand/paymentSuccess']);
          } else {
            this.utilityService.showSuccessToast('toast.downloadCampaignCreatePaymentPending');
            this.router.navigate(['brand/myCampaign']);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedAppsDownloadCampaignCreate');
        this.utilityService.hideLoading();
      }
    }

    // Clicks on the website
    if (this.campaignType == 'click_websites') {
      const campaignData: CreateClicksOnWebsiteCampaignRequestParameters = {
        "campaign_name": this.campaignName,
        "goal_of_campaign": this.goalOfTheCampaign,
        "start_date": moment(this.startingDate).format('YYYY-MM-DD'),
        "end_date": moment(this.endingDate).format('YYYY-MM-DD'),
        "product_information": this.productInformation,
        "cac": this.cac,
        "coins": this.coins,
        "user_target": this.usersTarget,
        "campaign_type": "click_websites",
        "campaign_type_name": "clicksonthewebsite",
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.campaignImage,
        "sub_total": this.totalBudget,
        "tax_value": this.taxPercentage,
        "total_budget": this.taxAmount,
        "country": countryValues,
        "start_age": this.startAge,
        "end_age": this.endAge,
        "gender": genderValues,
        "website_url": this.websiteUrl
      }

      this.utilityService.showLoading();
      try {
        const response: createCampaignResponseParameters = await this.brandService.createCampaignForClickWebsite(campaignData);
        if (response.success) {
          this.utilityService.hideLoading();
          if (paymentStatus === 'paymentSuccess' || paymentStatus === 'bankTransfer') {
            this.newlyCreatedCampaignId = response.data.id;
            this.utilityService.showSuccessToast('toast.clicksOnWebsiteCampaignCreated');
            this.router.navigate(['brand/paymentSuccess']);
          } else {
            this.utilityService.showSuccessToast('toast.clicksOnWebsiteCampaignCreatePaymentPending');
            this.router.navigate(['brand/myCampaign']);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedCreateWebsitesCampaign');
        this.utilityService.hideLoading();
      }
    }

    if (this.campaignType == 'questions_form') {
      const campaignData: CreateLeadCampaignRequestParameters = {
        "campaign_name": this.campaignName,
        "goal_of_campaign": this.goalOfTheCampaign,
        "start_date": moment(this.startingDate).format('YYYY-MM-DD'),
        "end_date": moment(this.endingDate).format('YYYY-MM-DD'),
        "product_information": this.productInformation,
        "cac": this.cac,
        "coins": this.coins,
        "user_target": this.usersTarget,
        "campaign_type": "questions_form",
        "campaign_type_name": 'questions_form',
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.campaignImage,
        "sub_total": this.totalBudget,
        "tax_value": this.taxPercentage,
        "total_budget": this.amountPay,
        "country": countryValues,
        "start_age": this.startAge,
        "end_age": this.endAge,
        "gender": genderValues
      }

      this.utilityService.showLoading();
      try {
        const response: createCampaignResponseParameters = await this.brandService.createCampaignForQuestions(campaignData);
        if (response.success) {
          this.utilityService.hideLoading();
          if (paymentStatus === 'paymentSuccess' || paymentStatus === 'bankTransfer') {
            this.newlyCreatedCampaignId = response.data.id;

            // (1)Add questions in question table
            const formData = {
              'campaign_id': this.newlyCreatedCampaignId,
              'form_name': this.questionsFormData.formName,
              'description': this.questionsFormData.formDescription
            };
            const responseData: any = await this.brandService.insertFormData(formData);
            if (!responseData.success) {
              this.utilityService.showErrorToast('toast.failedToInsertFormDetails');
            }

            // (2)Add campaign form quesions
            this.questionsFormData.rows.forEach((questionData: any) => {
              this.questionsLoop.push({
                "question_type_id": questionData.questionType[0].id,
                "campaign_form_id": responseData.data.id,
                "question_text": questionData.questionText,
                "answer_text": questionData.option1 ? [questionData.option1, questionData.option2, questionData.option3, questionData.option4] : ''
              });
            });

            //  console.log('QuestionsRequest', this.questionsLoop);


            const responseQuestionsData: any = await this.brandService.insertCampaignFormQuestions(this.questionsLoop);
            if (!responseQuestionsData.success) {
              this.utilityService.showErrorToast('toast.failedToInsertFormQuestions');
            }

            this.utilityService.showSuccessToast('toast.questionsCampaignCreate');
            this.router.navigate(['brand/paymentSuccess']);
          } else {
            this.utilityService.showSuccessToast('toast.questionCampaignUpdatePaymentPending');
            this.router.navigate(['brand/myCampaign']);
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedCreateLeadCampaign');
        this.utilityService.hideLoading();
      }
    }
    else if (this.campaignType == null) {
      this.utilityService.showErrorToast('toast.pleaseSelectCampaignFirst');
      this.utilityService.hideLoading();
      window.location.reload();
    }

  }

  async triggerVideoModal(content: any, task: any) {
    this.modalContent = task;
    this.modalReference = await this.modalPopupService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' })

    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
    // check if its youtube url extract youtube id from url
    if (this.youtube_video_url) {
      var video_id = this.youtube_video_url.split('v=')[1].split('&')[0];

      if (video_id) {
        this.video = video_id;
      }

      if (this.myWindow['YT']) {
        this.startVideo();
        return;
      }

      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag: any = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      /* 3. startVideo() will create an <iframe> (and YouTube player) after the API code downloads. */
      this.myWindow['onYouTubeIframeAPIReady'] = () => this.startVideo();

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

  selectPaymentMode(event: { checked: any; }) {
    this.utilityService.showLoading();
    setTimeout(() => {
      this.utilityService.sendClickEvent();
      if (event.checked) {
        this.paymentType = 'Paypal';
      } else {
        this.paymentType = 'Bank Transfer';
        this.isPreviewLoaded = false;
      }
      this.utilityService.hideLoading();
    }, 1000);
  }

  startVideo() {
    this.reframed = false;
    this.player = new this.myWindow['YT'].Player('player', {
      // height: '400',
      width: '100%',
      videoId: this.video,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        controls: 1,
        disablekb: 0,
        rel: 1,
        showinfo: 0,
        fs: 0,
        playsinline: 1
      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });

  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event: any) {
    switch (event.data) {
      case this.myWindow['YT'].PlayerState.ENDED:
        this.modalReference.close();
        break;
    };
  };

}
