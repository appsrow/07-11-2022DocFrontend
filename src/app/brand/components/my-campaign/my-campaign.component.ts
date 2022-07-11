import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { BrandService } from '../../services/brand.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { CampaignPosition, getCampaignPositionRequestParameters, getHighestCacRequestParameters, HighestCacResponse } from '../../models/campaign.model';
import { DatepickerOptions } from 'ng2-datepicker';
import { Country } from 'src/app/user/models/registration.model';
import { UserService } from 'src/app/user/services/user.service';
import { environment } from 'src/environments/environment';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { campaignInformationResponse, EditCampaignResponseParameters, MyCampaignResponseParameters, StartStopRequestParameters, UserIdRequestParameter } from '../../models/myCampaign.model';
import { HeaderService } from 'src/app/shared/services/header.service';
declare let $: any;
@Component({
  selector: 'app-my-campaign',
  templateUrl: './my-campaign.component.html',
  styleUrls: ['./my-campaign.component.scss']
})
export class MyCampaignComponent implements OnInit {

  currentCampaignDatas: any = [];
  programmedCampaignDatas: any = [];
  finishedCampaignDatas: any = [];
  selectedCampaignTab: string = 'current';
  createCampaignForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  imageError = '';
  campaignImage: any;
  selectedSocialMediaLinkLabel: string = 'Twitter link';
  isBudgetReadOnly: boolean = false;
  isProductInformationReadOnly: boolean = false;
  isVideoReadOnly: boolean = false;
  isSocialMediaLinkReadOnly: boolean = false;
  isAppDownloadLinkReadOnly: boolean = false;
  isWebisteVisitLinkReadOnly: boolean = false;
  isSocialSelectDisable: boolean = false;
  usersTarget: number = 0;
  minDate = moment().subtract(1, "days");
  maxDate = moment().toDate();
  minCAC: any;
  maximumCac: string = '';
  startDate: DatepickerOptions = {};
  endDate: DatepickerOptions = {};
  socialMedia = [] as any;
  uploadedVideoShow: string = '';
  youtubeVideoShow: string = '';
  videoSizeError = '';
  videoUrl: any;
  selectedTarget: string = '';
  campaignType: string = '';
  dropdownSettings = {};
  dropdownVideoSettings = {};
  genderList: any = [];
  countries: any;
  campaignInformation: any = {};
  taxPercentage: string = '';
  error = '';
  minTotalBudget: number = 1;
  showUpdateButton: boolean = true;
  isPaymentPending: boolean = true;
  modalContent: any;
  modalReference!: NgbModalRef;
  closeModal!: string;
  isBudgetIncreaseChecked: boolean = false;
  totalBudget: number = 0;
  campaignTabName: string = '';
  serverDate: any;
  serverDateFormate: any;
  paymentType: string = 'Paypal';
  showSubmitButton: boolean = false;
  newBudgetWithTax: string = '0';
  amountToPay: string = '';
  videoTypeSelection: any = [];
  showYoutubeVideoInput: boolean = false;
  showVideoInput: boolean = false;
  showVideoOptionSelect: boolean = false;
  youtubeVideoUrlString: any;
  // Variables for paypal payment
  myWindow: any;
  @ViewChild('paypal', { static: true }) paypalElement?: ElementRef;
  @ViewChild('paypalRef', { static: true }) paypalRef?: ElementRef;

  /* 1. Some required variables which will be used by YT API*/
  public YT: any;
  public video: any;
  public player: any;
  public reframed: Boolean = false;
  myYoutubeWindow: any = window;

  constructor(private brandService: BrandService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    public utilityService: UtilityService,
    private elementRef: ElementRef,
    private modalPopupService: NgbModal,
    private headerService: HeaderService) {
    this.myWindow = window;
  }

  async ngOnInit() {
    this.isBudgetIncreaseChecked = false;

    if ((this.route.snapshot.queryParams['campaignTab']) == 'programmedCampaigns') {
      this.tabClick('programmed_campaigns');
    }
    if ((this.route.snapshot.queryParams['campaignTab']) == 'finishedCampaigns') {
      this.tabClick('finished_campaigns');
    }
    if ((this.route.snapshot.queryParams['campaignTab']) == 'currentCampaigns') {
      this.tabClick('current_campaigns');
    }
    else if (!(this.route.snapshot.queryParams['campaignTab'])) {
      this.tabClick('current_campaigns');
    }

    this.createCampaignForm = this.formBuilder.group({
      campaignName: ['', Validators.required],
      goalOfCampaign: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      productInformation: ['', Validators.required],
      CAC: ['', Validators.required],
      usersTarget: ['', [Validators.required, Validators.min(1)]],
      totalBudget: ['', [Validators.required, Validators.min(1), Validators.max(99999)]],
      coins: ['', Validators.required],
      downloadLink: [''],
      campaignImage: ['', Validators.required],
      socialLink: [],
      socialMedia: [],
      websiteLink: [],
      videoUpload: [''],
      campaignPosition: [],
      totalAmount: [],
      selectedCountries: [[{ id: 207, itemName: 'Spain' }]],
      selectedGenders: [[]],
      fromAge: [],
      toAge: [],
      campaignId: ['', Validators.required],
      newBudget: ['0'],
      existingBudget: [],
      selectedVideoType: [],
      youtubeVideoUrl: []
    });

    this.dropdownSettings = {
      singleSelection: false,
      //text:"Select Countries",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };

    this.dropdownVideoSettings = {
      singleSelection: true,
      enableSearchFilter: false,
    }

    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.genderList = [
          { "id": 1, "itemName": "Masculino" },
          { "id": 2, "itemName": "Mujer" }
        ];
        this.videoTypeSelection = [
          { "id": 1, "itemName": "Subir vídeo" },
          { "id": 2, "itemName": "Ingrese la URL de YouTube" }
        ];
      } else {
        this.genderList = [
          { "id": 1, "itemName": "Male" },
          { "id": 2, "itemName": "Female" },
          { "id": 3, "itemName": "Other" },
        ];
        this.videoTypeSelection = [
          { "id": 1, "itemName": "Upload video" },
          { "id": 2, "itemName": "Youtube video link" }
        ];
      }
    });
    setTimeout(() => {
      this.startDate = {
        format: 'dd-MM-yyyy',
        placeholder: '',
        minDate: new Date(this.serverDateFormate)
      };
      this.endDate = {
        format: 'dd-MM-yyyy',
        placeholder: '',
        minDate: new Date(this.serverDateFormate)
      };
    }, 2000);
    await Promise.all([
      this.getCountries()
    ]);
    this.socialMedia = this.getSocialMediaList();
    this.taxPercentage = environment.taxPercentage;

    // on change of any form event
    // this.createCampaignForm.valueChanges.subscribe(() => {
    //   // check if the form is valid or not
    //   if(this.createCampaignForm.invalid){
    //     // remove paypal button
    //     if (this.paypalRef?.nativeElement.childNodes.length === 1) {
    //       this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
    //     }
    //   }else{
    //    // this.paypalFun('',)
    //   }
    // });
  }


  async tabClick(campaignTab: string) {
    const userData: UserIdRequestParameter = {
      'user_id': this.authService.getAccessToken().user_info.id
    }

    if (campaignTab == 'current_campaigns') {
      this.selectedCampaignTab = 'current';
      const res: MyCampaignResponseParameters = await this.brandService.getCurrentCampaignLists(userData);
      if (res.success && res.data.length > 0) {
        this.currentCampaignDatas = res.data;
        for (var i = 0; i < this.currentCampaignDatas.length; i++) {
          this.currentCampaignDatas[i].converted_created_at = moment(this.currentCampaignDatas[i].created_at).format('DD/MM/YYYY')
        }
        setTimeout(() => {
          $('#datatableexample1').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            retrieve: true,
            // processing: false,
            lengthMenu: [5, 10, 15],
            // destroy: false,
            order: []
          });
        }, 0);
      }
      else {
        this.currentCampaignDatas = [];
        setTimeout(() => {
          $('#datatableexample1').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            retrieve: true,
            // processing: false,
            lengthMenu: [5, 10, 15],
            // destroy: false,
            // order:[]
          });
        }, 0);
      }
    }
    if (campaignTab == 'programmed_campaigns') {
      this.selectedCampaignTab = 'programmed';
      const res: MyCampaignResponseParameters = await this.brandService.getProgrammedCampaignLists(userData);

      if (res.success && res.data.length > 0) {
        this.programmedCampaignDatas = res.data;
        for (var i = 0; i < this.programmedCampaignDatas.length; i++) {
          this.programmedCampaignDatas[i].converted_programmed_created_at = moment(this.programmedCampaignDatas[i].created_at).format('DD/MM/YYYY')
        }
        setTimeout(() => {
          $('#datatableexample2').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            retrieve: true,
            // processing: true,
            lengthMenu: [5, 10, 15],
            // destroy: true,
            order: []
          });
        }, 1);
      }
      else {
        this.programmedCampaignDatas = [];
        setTimeout(() => {
          $('#datatableexample2').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            retrieve: true,
            // processing: true,
            lengthMenu: [5, 10, 15],
            // destroy: true,
            order: []
          });
        }, 1);
      }
    }
    if (campaignTab == 'finished_campaigns') {
      this.selectedCampaignTab = 'finished';

      try {
        const res: MyCampaignResponseParameters = await this.brandService.getFinishedCampaignLists(userData);

        if (res.success && res.data.length > 0) {
          this.finishedCampaignDatas = res.data;
          for (var i = 0; i < this.finishedCampaignDatas.length; i++) {
            this.finishedCampaignDatas[i].converted_finished_created_at = moment(this.finishedCampaignDatas[i].created_at).format('DD/MM/YYYY')
          }
          setTimeout(() => {
            $('#datatableexample3').DataTable({
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              retrieve: true,
              lengthMenu: [5, 10, 15],
              // destroy: true,
              order: []
            });
          }, 1);
        }
        else {
          this.currentCampaignDatas = [];
          setTimeout(() => {
            $('#datatableexample3').DataTable({
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              retrieve: true,
              lengthMenu: [5, 10, 15],
              destroy: true,
              order: []
            });
          }, 1);
        }

      } catch (error) {
        this.utilityService.showErrorToast('toast.somethingWentWrong');
        console.log('some error');
      }
    }
  }

  async startStopCampaign(campaignStatus: string, campaignId: string) {
    this.spinner.show(undefined, {
      type: 'ball-clip-rotate-multiple'
    });
    if (campaignStatus == 'stopCampaign') {
      const campaignData = {
        "campaign_id": campaignId,
        "is_start": "0"
      }

      try {
        const response: StartStopRequestParameters = await this.brandService.startStopCampaignById(campaignData);

        this.spinner.hide();
        if (response.success) {
          this.utilityService.showSuccessToast('toast.campaignStatusPaused');
          this.tabClick('current_campaigns');
        }
      } catch (error) {
        this.spinner.hide();
        this.utilityService.showErrorToast('toast.somethingWentWrong');
      }
    }
    if (campaignStatus == 'startCampaign') {
      const campaignData = {
        "campaign_id": campaignId,
        "is_start": "1"
      }

      try {
        const res: StartStopRequestParameters = await this.brandService.startStopCampaignById(campaignData);

        this.spinner.hide();
        if (res.success) {
          this.tabClick('current_campaigns');
          this.utilityService.showSuccessToast('toast.campaignStatusStarted');
        }
      } catch (error) {
        this.spinner.hide();
        this.utilityService.showErrorToast('toast.somethingWentWrong');
        console.log('some error');
      }
    }
    else if (campaignId == '') {
      this.spinner.hide();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }
  }

  goToMyCampaigns() {
    this.router.navigate(['brand/campaignTarget']);
  }

  goToCampaignStatistics(campaignId: number, campaignType: string) {
    this.router.navigate(['brand/statistics'], { queryParams: { campaignId: campaignId, campaignType: campaignType } });
  }

  goToBrandUsers(campaignId: number) {
    this.router.navigate(['brand/lead-users'], { queryParams: { campaignId: campaignId } });
  }

  async getCampaignFormData(campaignId: string, campaignTabName: string) {
    this.showVideoInput = false;
    this.showYoutubeVideoInput = false;
    this.showVideoOptionSelect = false;
    this.amountToPay = '0';
    this.paymentType === 'Paypal';
    this.showSubmitButton = false;
    this.campaignTabName = campaignTabName;
    this.createCampaignForm.controls.newBudget.setValue(0);
    this.createCampaignForm.controls['newBudget'].clearValidators();
    this.createCampaignForm.controls['newBudget'].updateValueAndValidity();
    this.isBudgetIncreaseChecked = false;
    this.showUpdateButton = true;
    if (campaignId) {
      const campaignData = {
        "campaign_id": campaignId
      }

      this.spinner.show(undefined, {
        type: 'ball-clip-rotate-multiple'
      });

      try {
        const res: campaignInformationResponse = await this.brandService.getCampaignById(campaignData);
        if (res.success) {
          this.serverDate = new Date(res.datetime * 1000);
          this.serverDateFormate = moment(this.serverDate).subtract(1, "days");
          setTimeout(() => {
            this.startDate = {
              format: 'dd-MM-yyyy',
              placeholder: '',
              minDate: new Date(this.serverDateFormate)
            };
            this.endDate = {
              format: 'dd-MM-yyyy',
              placeholder: '',
              minDate: new Date(this.serverDateFormate)
            };
          }, 1000);

          if (this.paypalRef?.nativeElement.childNodes.length === 1) {
            this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
          }
          this.spinner.hide();
          let campaignDetails = res.data[0];
          this.youtubeVideoShow = campaignDetails.video_id;
          this.selectedTarget = campaignDetails.campaign_type_name;
          if (this.selectedTarget === 'uploadvideo' && !this.youtubeVideoShow) {
            this.createCampaignForm.controls['videoUpload'].setValidators([Validators.required]);
            this.createCampaignForm.controls['videoUpload'].updateValueAndValidity();
          } else {
            this.createCampaignForm.controls['videoUpload'].clearValidators();
            this.createCampaignForm.controls['videoUpload'].updateValueAndValidity();
          }

          this.getMaximumCacByCampaignType(this.selectedTarget);
          this.campaignType = campaignDetails.campaign_type;
          if (campaignDetails.campaign_status === 'APPROVED') {
            this.isPaymentPending = false;
            this.amountToPay = '0';
          } else {
            this.isPaymentPending = true;
            this.amountToPay = campaignDetails.total_budget;
          }
          // set minimum cac and total budget validators
          this.minCAC = campaignDetails.cac;
          this.minTotalBudget = campaignDetails.sub_total;
          this.createCampaignForm.controls['CAC'].setValidators([Validators.required, Validators.min(this.minCAC)]);
          this.createCampaignForm.controls['totalBudget'].setValidators([Validators.required, Validators.min(this.minTotalBudget)]);

          if (campaignDetails.is_approved === 'APPROVED') {
            this.isProductInformationReadOnly = true;
            this.isVideoReadOnly = true;
            this.isSocialMediaLinkReadOnly = true;
            this.isAppDownloadLinkReadOnly = true;
            this.isWebisteVisitLinkReadOnly = true;
            this.isSocialSelectDisable = true;
          } else {
            this.isProductInformationReadOnly = false;
            this.isVideoReadOnly = false;
            this.isSocialMediaLinkReadOnly = false;
            this.isAppDownloadLinkReadOnly = false;
            this.isWebisteVisitLinkReadOnly = false;
            this.isSocialSelectDisable = true;
          }

          if (campaignDetails.country) {
            let countryVals = campaignDetails.country.split(',');
            var countryResult = [];

            for (let country of this.countries) {
              for (let countryId of countryVals) {
                if (country.id === parseInt(countryId)) {
                  countryResult.push({ id: country.id, itemName: country.itemName });
                }
              }
            }
          }

          let genderVals = campaignDetails.gender;
          if (genderVals) {
            var genderResult = this.genderList.filter((genderListItem: any) => genderVals.includes(genderListItem.id));
          }

          this.uploadedVideoShow = campaignDetails.uploaded_video_url;
          this.youtubeVideoShow = campaignDetails.video_id;
          this.youtubeVideoUrlString = campaignDetails.youtube_video_url;
          this.createCampaignForm.patchValue({
            campaignName: campaignDetails.campaign_name,
            goalOfCampaign: campaignDetails.goal_of_campaign,
            startDate: new Date(campaignDetails.start_date),
            endDate: new Date(campaignDetails.end_date),
            productInformation: campaignDetails.product_information,
            CAC: campaignDetails.cac,
            usersTarget: campaignDetails.user_target,
            totalBudget: campaignDetails.sub_total,
            existingBudget: campaignDetails.sub_total,
            coins: campaignDetails.coins,
            totalAmount: campaignDetails.total_budget,
            downloadLink: campaignDetails.app_download_link,
            socialMedia: campaignDetails.selected_social_media_name,
            websiteLink: campaignDetails.website_url,
            socialLink: campaignDetails.selected_social_media_url,
            user_id: this.authService.getAccessToken().user_info.id,
            campaignImage: campaignDetails.campaign_image,
            videoUpload: campaignDetails.uploaded_video_url,
            fromAge: campaignDetails.start_age,
            toAge: campaignDetails.end_age,
            selectedCountries: countryResult,
            selectedGenders: genderResult,
            campaignId: campaignDetails.id
          });
          this.totalBudget = campaignDetails.sub_total;
          this.getPaypalButtonForPayment(this.isPaymentPending);
          let coins = this.createCampaignForm.value.coins;
          this.getCampaignPosition(coins);
          this.isBudgetReadOnly = true;
          this.getSocialMedia(campaignDetails.selected_social_media_name);
          $(this.elementRef.nativeElement).find('#campaign_details')
            .modal('show');
        } else {
          console.log('some error');
          throw new Error(res.message);
        }

      } catch (error) {
        this.spinner.hide();
        this.utilityService.showErrorToast('toast.somethingWentWrong');
        console.log('some error');
      }

    } else {
      //Redirect to home
    }
  }

  async brandUpdateCampaign() {
    this.submitted = true;
    if (this.createCampaignForm.invalid) {
      return;
    } else {
      // update
      this.utilityService.showLoading();
      if (this.createCampaignForm.value.campaignId) {
        // To fetch country id 
        let selectedCountries = [];
        if (this.createCampaignForm.value.selectedCountries) {
          for (var item of this.createCampaignForm.value.selectedCountries) {
            selectedCountries.push(item.id);
          }
        }

        // To fetch gender id 
        let selectedGenders = [];
        if (this.createCampaignForm.value.selectedGenders) {
          for (var item of this.createCampaignForm.value.selectedGenders) {
            selectedGenders.push(item.id);
          }
        }

        if (this.selectedTarget == 'Lead') {
          const campaignData = {
            "campaign_id": this.createCampaignForm.value.campaignId,
            "campaign_name": this.createCampaignForm.value.campaignName,
            "goal_of_campaign": this.createCampaignForm.value.goalOfCampaign,
            "start_date": moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
            "end_date": moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
            "product_information": this.createCampaignForm.value.productInformation,
            "cac": this.createCampaignForm.value.CAC,
            "total_budget": this.createCampaignForm.value.totalBudget,
            "coins": this.createCampaignForm.value.coins,
            "user_target": this.createCampaignForm.value.usersTarget,
            "campaign_type": "lead_target",
            "campaign_type_name": 'Lead',
            "user_id": this.authService.getAccessToken().user_info.id,
            "campaign_image": this.createCampaignForm.value.campaignImage,
            "sub_total": this.createCampaignForm.value.totalBudget,
            "tax_value": this.taxPercentage,
            "country": selectedCountries.toString(),
            "start_age": this.createCampaignForm.value.fromAge,
            "end_age": this.createCampaignForm.value.toAge,
            "gender": selectedGenders.toString()
          }

          try {
            const res: EditCampaignResponseParameters = await this.brandService.editProgrammedCampaign(campaignData);

            this.spinner.hide();
            if (res.success) {
              this.utilityService.showSuccessToast('toast.leadCampaignUpdate');
              setTimeout(() => {
                this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignTabName } })
                  .then(() => {
                    window.location.reload();
                  });
              }, 2000);
            } else {
              this.spinner.hide();
              this.error = res.message;
            }
          } catch (error) {
            this.spinner.hide();
            this.utilityService.showErrorToast('toast.somethingWentWrong');
            console.log('some error');
          }
        }


        // Type video upload
        if (this.selectedTarget == 'uploadvideo') {
          const campaignData = {
            "campaign_id": this.createCampaignForm.value.campaignId,
            "uploaded_video_url": this.createCampaignForm.value.videoUpload,
            "campaign_name": this.createCampaignForm.value.campaignName,
            "goal_of_campaign": this.createCampaignForm.value.goalOfCampaign,
            "start_date": moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
            "end_date": moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
            "product_information": this.createCampaignForm.value.productInformation,
            "cac": this.createCampaignForm.value.CAC,
            "total_budget": this.createCampaignForm.value.totalBudget,
            "coins": this.createCampaignForm.value.coins,
            "user_target": this.createCampaignForm.value.usersTarget,
            "campaign_type": "video_plays",
            "campaign_type_name": 'uploadvideo',
            "user_id": this.authService.getAccessToken().user_info.id,
            "campaign_image": this.createCampaignForm.value.campaignImage,
            "sub_total": this.createCampaignForm.value.totalBudget,
            "tax_value": this.taxPercentage,
            "country": selectedCountries.toString(),
            "start_age": this.createCampaignForm.value.fromAge,
            "end_age": this.createCampaignForm.value.toAge,
            "gender": selectedGenders.toString(),
            "youtube_video_url": this.createCampaignForm.value.youtubeVideoUrl ? this.createCampaignForm.value.youtubeVideoUrl : this.youtubeVideoUrlString,
          }

          try {
            const res: EditCampaignResponseParameters = await this.brandService.editProgrammedCampaign(campaignData);

            this.spinner.hide();
            if (res.success) {
              this.utilityService.showSuccessToast('toast.videoCampaignUpdate');
              setTimeout(() => {
                this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignTabName } })
                  .then(() => {
                    window.location.reload();
                  });
              }, 2000);
            } else {
              this.spinner.hide();
              this.error = res.message;
            }
          } catch (error) {
            this.spinner.hide();
            this.utilityService.showErrorToast('toast.somethingWentWrong');
            console.log('some error');
          }
        }

        // Type Follow
        if (this.selectedTarget == 'Follow') {
          const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
          this.createCampaignForm.controls['socialLink'].setValidators([Validators.required]);
          const campaignData = {
            "campaign_id": this.createCampaignForm.value.campaignId,
            "campaign_name": this.createCampaignForm.value.campaignName,
            "goal_of_campaign": this.createCampaignForm.value.goalOfCampaign,
            "start_date": moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
            "end_date": moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
            "product_information": this.createCampaignForm.value.productInformation,
            "cac": this.createCampaignForm.value.CAC,
            "total_budget": this.createCampaignForm.value.totalBudget,
            "coins": this.createCampaignForm.value.coins,
            "user_target": this.createCampaignForm.value.usersTarget,
            "campaign_type": "follow",
            "campaign_type_name": 'Follow',
            "user_id": this.authService.getAccessToken().user_info.id,
            "campaign_image": this.createCampaignForm.value.campaignImage,
            "selected_social_media_name": this.createCampaignForm.value.socialMedia,
            "selected_social_media_url": this.createCampaignForm.value.socialLink,
            "sub_total": this.createCampaignForm.value.totalBudget,
            "tax_value": this.taxPercentage,
            "country": selectedCountries.toString(),
            "start_age": this.createCampaignForm.value.fromAge,
            "end_age": this.createCampaignForm.value.toAge,
            "gender": selectedGenders.toString()
          }

          try {
            const res: EditCampaignResponseParameters = await this.brandService.editProgrammedCampaign(campaignData);

            if (res.success) {
              this.spinner.hide();
              this.utilityService.showSuccessToast('toast.followCampaignUpdate');
              setTimeout(() => {
                this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignTabName } })
                  .then(() => {
                    window.location.reload();
                  });
              }, 2000);
            } else {
              this.spinner.hide();
              this.error = res.message;
            }
          } catch (error) {
            this.spinner.hide();
            console.log('some error');
          }
        }

        // Apps download
        if (this.selectedTarget == 'Appsdownload') {
          const campaignData = {
            "campaign_id": this.createCampaignForm.value.campaignId,
            "campaign_name": this.createCampaignForm.value.campaignName,
            "goal_of_campaign": this.createCampaignForm.value.goalOfCampaign,
            "start_date": moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
            "end_date": moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
            "product_information": this.createCampaignForm.value.productInformation,
            "cac": this.createCampaignForm.value.CAC,
            "total_budget": this.createCampaignForm.value.totalBudget,
            "coins": this.createCampaignForm.value.coins,
            "user_target": this.createCampaignForm.value.usersTarget,
            "campaign_type": "apps_download",
            "campaign_type_name": 'Appsdownload',
            "user_id": this.authService.getAccessToken().user_info.id,
            "campaign_image": this.createCampaignForm.value.campaignImage,
            "app_download_link": this.createCampaignForm.value.downloadLink,
            "sub_total": this.createCampaignForm.value.totalBudget,
            "tax_value": this.taxPercentage,
            "country": selectedCountries.toString(),
            "start_age": this.createCampaignForm.value.fromAge,
            "end_age": this.createCampaignForm.value.toAge,
            "gender": selectedGenders.toString()
          }

          try {
            const res: EditCampaignResponseParameters = await this.brandService.editProgrammedCampaign(campaignData);
            if (res.success) {
              this.spinner.hide();
              this.utilityService.showSuccessToast('toast.appDownloadCampaignUpdate');
              setTimeout(() => {
                this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignTabName } })
                  .then(() => {
                    window.location.reload();
                  });
              }, 2000);
            } else {
              this.spinner.hide();
              this.error = res.message;
            }
          } catch (error) {
            this.utilityService.showErrorToast('toast.somethingWentWrong');
            console.log('some error');
          }
        }

        // Clicks on the website
        if (this.selectedTarget == 'clicksonthewebsite') {
          const campaignData = {
            "campaign_id": this.createCampaignForm.value.campaignId,
            "campaign_name": this.createCampaignForm.value.campaignName,
            "goal_of_campaign": this.createCampaignForm.value.goalOfCampaign,
            "start_date": moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
            "end_date": moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
            "product_information": this.createCampaignForm.value.productInformation,
            "cac": this.createCampaignForm.value.CAC,
            "total_budget": this.createCampaignForm.value.totalBudget,
            "coins": this.createCampaignForm.value.coins,
            "user_target": this.createCampaignForm.value.usersTarget,
            "campaign_type": "click_websites",
            "campaign_type_name": "clicksonthewebsite",
            "user_id": this.authService.getAccessToken().user_info.id,
            "campaign_image": this.createCampaignForm.value.campaignImage,
            "website_url": this.createCampaignForm.value.websiteLink,
            "sub_total": this.createCampaignForm.value.totalBudget,
            "tax_value": this.taxPercentage,
            "country": selectedCountries.toString(),
            "start_age": this.createCampaignForm.value.fromAge,
            "end_age": this.createCampaignForm.value.toAge,
            "gender": selectedGenders.toString()
          }

          try {
            const res: EditCampaignResponseParameters = await this.brandService.editProgrammedCampaign(campaignData);
            if (res.success) {
              this.spinner.hide();
              this.utilityService.showSuccessToast('toast.visitCampaignUpdate');
              setTimeout(() => {
                this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignTabName } })
                  .then(() => {
                    window.location.reload();
                  });
              }, 2000);
            } else {
              this.spinner.hide();
              this.error = res.message;
            }
          } catch (error) {
            this.utilityService.showErrorToast('toast.somethingWentWrong');
            console.log('some error');
          }
        }

      }
    }
  }

  onSelectCampaignImage(event: any) {
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
          this.createCampaignForm.controls.campaignImage.setValue(event.target.result);
        }
      }
    }
  }

  delete(): void {
    this.createCampaignForm.controls.campaignImage.setValue('');
    this.campaignImage = '';
  }

  ValidateAge() {
    let fromAge = this.createCampaignForm.value.fromAge;
    let toAge = this.createCampaignForm.value.toAge;

    if (fromAge) {
      this.createCampaignForm.controls['toAge'].setValidators([Validators.required, Validators.min(1), Validators.max(65)]);
      this.createCampaignForm.controls['toAge'].updateValueAndValidity();
    } else {
      this.createCampaignForm.controls['fromAge'].clearValidators();
      this.createCampaignForm.controls['fromAge'].updateValueAndValidity();
    }

    if (toAge) {
      this.createCampaignForm.controls['fromAge'].setValidators([Validators.required, Validators.min(1), Validators.max(35)]);
      this.createCampaignForm.controls['fromAge'].updateValueAndValidity();
    } else {
      this.createCampaignForm.controls['fromAge'].clearValidators();
      this.createCampaignForm.controls['fromAge'].updateValueAndValidity();
    }

    if ((!fromAge && !toAge)) {
      this.createCampaignForm.controls['fromAge'].clearValidators();
      this.createCampaignForm.controls['fromAge'].updateValueAndValidity();
      this.createCampaignForm.controls['toAge'].clearValidators();
      this.createCampaignForm.controls['toAge'].updateValueAndValidity();
    }

    if (fromAge && toAge) {
      this.createCampaignForm.controls['toAge'].setValidators([Validators.min(fromAge), Validators.max(65)]);
      this.createCampaignForm.controls['toAge'].updateValueAndValidity();

    }
  }



  onChangeEvent(event: any, totalBudgetValue?: string) {
    if (event.key === 'Tab') {
      return
    }
    let cac = this.createCampaignForm.value.CAC;
    let total_budget = this.createCampaignForm.value.totalBudget;

    let newBudget = this.createCampaignForm.value.newBudget;
    let newBudgetWithTax1 = parseFloat(newBudget) + ((newBudget * 21) / 100);
    let newBudgetWithTax = parseFloat(newBudgetWithTax1.toString()).toFixed(2);
    this.newBudgetWithTax = newBudgetWithTax;

    if (totalBudgetValue === 'newBudget') {
      total_budget = parseFloat(this.createCampaignForm.value.existingBudget) + parseFloat(this.createCampaignForm.value.newBudget);
      this.createCampaignForm.controls.totalBudget.setValue(total_budget);
      this.totalBudget = total_budget;
    }

    let usersTarget = total_budget / cac;
    let usersTargetRoundDownTo = Math.floor(usersTarget);
    let usersTargetValidatate = this.utilityService.isNumeric(usersTargetRoundDownTo);

    this.usersTarget = 0;
    if (usersTargetValidatate) {
      this.createCampaignForm.controls.usersTarget.setValue(usersTargetRoundDownTo);
      this.usersTarget = usersTargetRoundDownTo;
    } else {
      this.createCampaignForm.controls.usersTarget.setValue(0);
      this.usersTarget = 0;
    }

    let coins = ((cac / 2) * 166.3860);
    let coinsRoundTo = parseFloat(coins.toString()).toFixed(2);
    this.createCampaignForm.controls.coins.setValue(coinsRoundTo);

    this.getCampaignPosition(coins);

    let totalAmount = parseFloat(total_budget) + ((total_budget * 21) / 100);

    this.createCampaignForm.controls.totalAmount.setValue(totalAmount);

    if (totalBudgetValue) {
      if (this.paypalRef?.nativeElement.childNodes.length === 1) {
        this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
      }
      this.submitted = true;
      // If the payment is not done and we are paying whole amount
      if (this.isPaymentPending === true) {
        let totalBudget = total_budget;
        let newBudgetWithTax1 = parseFloat(totalBudget) + ((totalBudget * 21) / 100);
        let newBudgetWithTax = parseFloat(newBudgetWithTax1.toString()).toFixed(2);
        this.newBudgetWithTax = newBudgetWithTax;
        this.amountToPay = this.newBudgetWithTax;
        if (this.createCampaignForm.valid && this.paymentType === 'Paypal') {
          this.paypalFun(newBudgetWithTax, this.isPaymentPending);
        } else {
          // remove paypal button
          if (this.paypalRef?.nativeElement.childNodes.length === 1) {
            this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
          }
        }
        this.showUpdateButton = false;
      } else {
        let budget = this.createCampaignForm.value.totalBudget;
        // If the payment is done and we are increasing the budget
        if (this.createCampaignForm.valid) {
          this.amountToPay = this.newBudgetWithTax;
          if (this.createCampaignForm.valid && this.paymentType === 'Paypal') {
            this.paypalFun(newBudgetWithTax, this.isPaymentPending);
          } else {
            if (this.paypalRef?.nativeElement.childNodes.length === 1) {
              this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
            }
          }
          this.showUpdateButton = false;
        } else {
          this.showUpdateButton = true;
          this.amountToPay = '0';
        }
      }
    }
  }

  async getCampaignPosition(coin: number) {
    const campaignData: getCampaignPositionRequestParameters = {
      'coin': coin
    }
    try {
      const response: CampaignPosition = await this.brandService.getCampaignPosition(campaignData);
      if (response.success) {
        let campaignPosition = response.data[0].position
        this.createCampaignForm.controls.campaignPosition.setValue(campaignPosition);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCampaignPosition');
      this.utilityService.hideLoading();
    }
  }

  deleteVideo() {
    this.uploadedVideoShow = '';
    this.createCampaignForm.controls.videoUpload.setValue('');
    this.youtubeVideoShow = '';
    this.createCampaignForm.controls.youtubeVideoUrl.setValue('');
    this.showVideoOptionSelect = true;
    this.youtubeVideoUrlString = '';
    this.createCampaignForm.controls['videoUpload'].clearValidators();
    this.createCampaignForm.controls['videoUpload'].updateValueAndValidity();
    this.createCampaignForm.get('selectedVideoType')?.setValidators([Validators.required]);
    this.createCampaignForm.controls['selectedVideoType'].updateValueAndValidity();
  }

  changeCacValue(event: any) {
    let selectedSocialMedia = event.target.value;

    const campaignTargetData = {
      'target_id': '3'
    }

    return this.brandService.getMinimumCAC(campaignTargetData).then(res => {
      this.minCAC = res.data.target_subtype[0].minimum_cac;
      if (selectedSocialMedia == 'youtube') {
        const youtubeRegex = '^(https://(www.)?youtube.com/)(user|c|channel)/.{3,}.*';
        this.minCAC = res.data.target_subtype[3].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(youtubeRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Youtube link';
      }
      if (selectedSocialMedia == 'instagram') {
        const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
        this.minCAC = res.data.target_subtype[1].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Instagram link';
      }
      if (selectedSocialMedia == 'twitter') {
        const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
        this.minCAC = res.data.target_subtype[0].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Twitter link';
      }
      if (selectedSocialMedia == 'twitch') {
        const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
        this.minCAC = res.data.target_subtype[2].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Twitch link';
      }
      if (selectedSocialMedia == 'Select social media') {
        const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
        this.minCAC = res.data.target_subtype[0].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Social media link';
      }
      if (selectedSocialMedia == 'facebook') {
        const facebookRegex = '^(https://(www.)?facebook.com/)(([a-zA-Z0-9_]+){3,})';
        this.minCAC = res.data.target_subtype[4].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(facebookRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Facebook link';
      }

      // update users target on the basis of cac change
      let cac = this.createCampaignForm.value.CAC;
      let total_budget = this.createCampaignForm.value.totalBudget;

      let usersTarget = total_budget / cac;
      let usersTargetRoundDownTo = Math.floor(usersTarget);
      let usersTargetValidatate = this.utilityService.isNumeric(usersTargetRoundDownTo);

      if (usersTargetValidatate) {
        this.createCampaignForm.controls.usersTarget.setValue(usersTargetRoundDownTo);
        this.usersTarget = usersTargetRoundDownTo;
      } else {
        this.createCampaignForm.controls.usersTarget.setValue(0);
        this.usersTarget = 0;
      }
    });
  }

  onSelectVideo(event: any) {
    // const duration = event.target.files[0].duration;

    const maxsize = 13666304; // Resolution 1920 * 1080
    const file: File = event.target.files[0];
    var numb = file.size;
    // var duration = file.
    if (numb <= maxsize) {

      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        let filePath = file.name;

        let allowedExtensions = /(\.mp4|\.mpeg|\.mpeg2|\.mpeg4)$/i;
        if (!allowedExtensions.exec(filePath)) {
          // file.name = '';
          this.videoSizeError = 'Not valid video extension. Only .mp4, .mpeg, .mpeg2, .mpeg4 video extensions are allowed'
          this.submitted = false;
          return;
        } else {
          this.submitted = true;
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event: any) => {
            this.videoSizeError = '';
            this.createCampaignForm.controls.videoUpload.setValue(event.target.result);
            this.videoUrl = event.target.result;
          }
        }
      }
    }
    else {
      this.videoSizeError = 'Video size not valid. Please upload size no longer than 13mb.'
      this.submitted = false;
      // Swal.fire({
      //   type: 'error',
      //   title: 'Please upload a file with a valid file size. No larger than 1mb. Please upload another file.',
      //   showConfirmButton: false,
      //   timer: 2000
      // })
    }
  }

  isClicked() {
    this.createCampaignForm.controls.videoUpload.setValue('');
  }

  onItemSelect(item: any) {
    // console.log(item);
    // console.log(this.createCampaignForm.controls.selectedCountries);
  }
  OnItemDeSelect(item: any) {
    // console.log(item);
    // console.log(this.createCampaignForm.controls.selectedCountries);
  }
  onSelectAll(items: any) {
    // console.log(items);
  }
  onDeSelectAll(items: any) {
    // console.log(items);
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

  getSocialMedia(socialMediaName: string) {
    let selectedSocialMedia = socialMediaName;
    if (selectedSocialMedia == 'youtube') {
      const youtubeRegex = '^(https://(www.)?youtube.com/)(user|c|channel)/.{3,}.*';
      this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(youtubeRegex)]);
      this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Youtube link';
    }
    if (selectedSocialMedia == 'instagram') {
      const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
      this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
      this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Instagram link';
    }
    if (selectedSocialMedia == 'twitter') {
      const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
      this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Twitter link';
    }
    if (selectedSocialMedia == 'twitch') {
      const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
      this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
      this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Twitch link';
    }
    if (selectedSocialMedia == 'Select social media') {
      const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
      this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Social media link';
    }
    if (selectedSocialMedia == 'facebook') {
      const facebookRegex = '^(https://(www.)?facebook.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.get('socialLink')?.setValidators([Validators.required, Validators.pattern(facebookRegex)]);
      this.createCampaignForm.controls['socialLink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Facebook link';
    }
  }


  paypalFun(amount: any, isPaymentPending: boolean) {
    let self = this;

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
          this.brandUpdateCampaignWithBudget(details, amount, this.isPaymentPending)
        });
      },

      // Show an error page here, when an error occurs
      onError: function (err: any) {
        //self.callPreviewMethod();
        //this.campaignPreviewComponent.brandCreateCampaign('noPayment');
      },

      onCancel: function (data: any, actions: any) {
        //self.callPreviewMethod();
        self.toastr.error('Payment is not done.');
      }

    }).render(this.paypalRef?.nativeElement);


    // paypal code over
  }

  async capturePaymentDetails(details: any, cac: any, amount: any) {
    const paymentDetails = details;
    paymentDetails.campaign_id = this.createCampaignForm.value.campaignId;
    paymentDetails.campaing_status = 'APPROVED';
    paymentDetails.transaction_date = moment(details.create_time).format('YYYY-MM-DD');
    paymentDetails.transaction_id = details.purchase_units[0].payments.captures[0].id;
    paymentDetails.transaction_type = 'paypal';
    paymentDetails.transaction_status = details.status;
    paymentDetails.paypal_id = details.purchase_units[0].payee.email_address;
    paymentDetails.paypal_reference_number = details.purchase_units[0].payee.merchant_id;
    // paymentDetails.grand_total = details.purchase_units[0].amount.value;
    paymentDetails.grand_total = this.minTotalBudget;
    paymentDetails.cac = cac;
    paymentDetails.tax_percentage = environment.taxPercentage;

    try {
      const response: any = await this.brandService.paypalBrandPayment(paymentDetails);
      if (response.success) {
        this.utilityService.showSuccessToast('toast.campaignUpdated');
        this.router.navigate(['brand/paymentSuccess']);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedCreateCampaign');
    }
  }

  async triggerVideoModal(content: any, task: any) {
    //this.modalReference.close();
    this.modalContent = task;
    this.modalReference = await this.modalPopupService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' })

    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
    // check if its youtube url extract youtube id from url
    if (this.youtubeVideoShow) {
      if (this.myYoutubeWindow['YT']) {
        this.startVideo();
        return;
      }

      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag: any = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      /* 3. startVideo() will create an <iframe> (and YouTube player) after the API code downloads. */
      this.myYoutubeWindow['onYouTubeIframeAPIReady'] = () => this.startVideo();

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

  getPaypalButtonForPayment(isPaymentPending: boolean) {
    if (isPaymentPending === true) {
      // show paypal button
      this.showUpdateButton = false;
      let total_budget = this.createCampaignForm.value.totalBudget;
      let cac = this.createCampaignForm.value.CAC;
      let totalAmount = parseFloat(total_budget) + ((total_budget * 21) / 100);
      this.createCampaignForm.controls.totalAmount.setValue(totalAmount);
      this.paypalFun(totalAmount, this.isPaymentPending);
    } else {
      this.showUpdateButton = true;
    }
  }

  async brandUpdateCampaignWithBudget(details: any, amount: any, isPaymentPending: boolean) {
    this.utilityService.showLoading();
    // To fetch country id 
    var countryVals = [];
    let countryValues: any;
    if (this.createCampaignForm.value.selectedCountries) {
      for (var item of this.createCampaignForm.value.selectedCountries) {
        countryVals.push(item.id);
      }
      countryValues = countryVals.toString();
    }

    // To fetch gender id 
    var genderVals = [];
    let genderValues: any;
    if (this.createCampaignForm.value.selectedGenders) {
      for (var item of this.createCampaignForm.value.selectedGenders) {
        genderVals.push(item.id);
      }
      genderValues = genderVals.toString();
    }

    const paymentDetails = details;
    paymentDetails.campaign_id = this.createCampaignForm.value.campaignId;
    paymentDetails.campaign_name = this.createCampaignForm.value.campaignName;
    paymentDetails.campaign_type = this.campaignType,
      paymentDetails.campaign_type_name = this.selectedTarget,
      paymentDetails.goal_of_campaign = this.createCampaignForm.value.goalOfCampaign,
      paymentDetails.start_date = moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
      paymentDetails.end_date = moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
      paymentDetails.product_information = this.createCampaignForm.value.productInformation,
      paymentDetails.user_target = this.createCampaignForm.value.usersTarget;
    paymentDetails.cac = this.createCampaignForm.value.CAC;
    paymentDetails.coins = this.createCampaignForm.value.coins,
      paymentDetails.sub_total = (isPaymentPending === true) ? this.createCampaignForm.value.totalBudget : this.createCampaignForm.value.newBudget,
      paymentDetails.tax_percentage = environment.taxPercentage,
      paymentDetails.country = countryValues,
      paymentDetails.start_age = this.createCampaignForm.value.fromAge,
      paymentDetails.end_age = this.createCampaignForm.value.toAge,
      paymentDetails.gender = genderValues ? genderValues : '',
      //paymentDetails.campaing_status = 'APPROVED';
      paymentDetails.transaction_date = moment(details.create_time).format('YYYY-MM-DD'),
      paymentDetails.transaction_id = details.id ? details.id : '',
      paymentDetails.transaction_type = details.id ? 'paypal' : 'BANK_TANSFER',
      paymentDetails.transaction_status = details.status ? details.status : 'COMPLETED';
    paymentDetails.paypal_id = details.purchase_units ? details.purchase_units[0].payee.email_address : '',
      paymentDetails.paypal_reference_number = details.purchase_units ? details.purchase_units[0].payee.merchant_id : '',
      // paymentDetails.grand_total = details.purchase_units[0].amount.value;
      paymentDetails.grand_total = amount,
      paymentDetails.campaign_image = this.createCampaignForm.value.campaignImage,
      paymentDetails.uploaded_video_url = this.createCampaignForm.value.videoUpload,
      paymentDetails.youtube_video_url = this.createCampaignForm.value.youtubeVideoUrl ? this.createCampaignForm.value.youtubeVideoUrl : this.youtubeVideoUrlString,

      paymentDetails.selected_social_media_name = (this.selectedTarget === 'Follow') ? this.createCampaignForm.value.socialMedia : '',
      paymentDetails.selected_social_media_url = this.createCampaignForm.value.socialLink,
      paymentDetails.app_download_link = this.createCampaignForm.value.downloadLink,
      paymentDetails.website_url = this.createCampaignForm.value.websiteLink
    try {
      const response: any = await this.brandService.paypalbrandUpdateCampaignWithBudget(paymentDetails);
      if (response.success) {
        this.utilityService.hideLoading();
        this.utilityService.showSuccessToast('toast.campaignUpdated');
        setTimeout(() => {
          this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignTabName } })
            .then(() => {
              window.location.reload();
            });
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedCreateCampaign');
    }
  }

  getSocialMediaList() {
    return [
      { id: 'twitter', name: 'Twitter' },
      // { id: 'instagram', name: 'Instagram' },
      // { id: 'twitch', name: 'Twitch' },
      { id: 'youtube', name: 'Youtube' },
      { id: 'facebook', name: 'Facebook' }
    ];
  }

  checkCheckBoxvalue(event: { checked: any; }) {
    this.isBudgetIncreaseChecked = event.checked;
    if (this.isBudgetIncreaseChecked === false) {
      this.createCampaignForm.controls.newBudget.setValue(0);
      this.createCampaignForm.controls['newBudget'].clearValidators();
      this.createCampaignForm.controls['newBudget'].updateValueAndValidity();
      this.createCampaignForm.controls.totalBudget.setValue(this.createCampaignForm.value.existingBudget);
      this.totalBudget = this.createCampaignForm.value.existingBudget;
      if (this.paypalRef?.nativeElement.childNodes.length === 1) {
        this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
      }
      this.showUpdateButton = true;
    } else {
      this.createCampaignForm.get('newBudget')?.setValidators([Validators.required, Validators.min(1)]);
    }
  }

  async getMaximumCacByCampaignType(campType: string) {
    if (campType === 'Lead') {
      this.campaignType = 'lead_target'
    }
    if (campType === 'uploadvideo') {
      this.campaignType = 'video_plays'
    }
    if (campType === 'Follow') {
      this.campaignType = 'follow'
    }
    if (campType === 'Appsdownload') {
      this.campaignType = 'apps_download'
    }
    if (campType === 'clicksonthewebsite') {
      this.campaignType = 'click_websites'
    }

    if (this.campaignType) {
      const requestBody: getHighestCacRequestParameters = {
        campaign_type: this.campaignType
      }
      this.utilityService.showLoading();
      try {
        const response: HighestCacResponse = await this.brandService.getMaximumCacByCampaignType(requestBody);
        if (response.success) {
          this.utilityService.hideLoading();
          this.maximumCac = `${response.data[0].max_cac}.`;
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedToGetHighestCac');
        this.utilityService.hideLoading();
      }
    }
  }

  selectPaymentMode(event: { checked: any; }) {
    if (event.checked) {
      this.paymentType = 'Paypal';
      this.showSubmitButton = false;
      this.getPaypalButtonForPayment(true);
    } else {
      this.paymentType = 'Bank Transfer';
      if (this.paypalRef?.nativeElement.childNodes.length === 1) {
        this.paypalRef?.nativeElement.removeChild(this.paypalRef?.nativeElement.childNodes[0]);
      }
      this.showSubmitButton = true;
    }
  }

  doBankTransferPayment() {
    this.showSubmitButton = false;
    // If the payment is not done and we are paying whole amount
    if (this.isPaymentPending === true) {
      this.brandUpdateCampaignWithBudget({}, this.newBudgetWithTax, true);
    } else {
      // If the payment is done and we are increasing budget
      this.brandUpdateCampaignWithBudget({}, this.newBudgetWithTax, false);
    }
  }

  startVideo() {
    console.log('start video', this.youtubeVideoShow);


    this.reframed = false;
    this.player = new this.myWindow['YT'].Player('player', {
      // height: '400',
      width: '100%',
      videoId: this.youtubeVideoShow,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        controls: 1,
        disablekb: 0,
        rel: 1,
        showinfo: 0,
        fs: 0,
        playsinline: 1,

      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });

  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event: any) {
    switch (event.data) {
      case this.myYoutubeWindow['YT'].PlayerState.ENDED:
        this.modalReference.close();
        break;
    };
  };

  onVideoTypeSelect(item: any) {
    if (item.id == '1') {
      this.showVideoInput = true;
      this.showYoutubeVideoInput = false;
      this.createCampaignForm.get('videoUpload')?.setValidators([Validators.required]);
      this.createCampaignForm.controls['videoUpload'].updateValueAndValidity();
      this.createCampaignForm.controls['youtubeVideoUrl'].clearValidators();
      this.createCampaignForm.controls['youtubeVideoUrl'].updateValueAndValidity();
    }
    if (item.id == '2') {
      this.showVideoInput = false;
      this.showYoutubeVideoInput = true;
      const youtubeRegex = '^(https://(www.)?youtube.com/)(user|c|channel)/.{3,}.*';
      const youtubeVideoRegex = '^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$';
      this.createCampaignForm.get('youtubeVideoUrl')?.setValidators([Validators.required, Validators.pattern(youtubeVideoRegex)]);
      this.createCampaignForm.controls['videoUpload'].clearValidators();
      this.createCampaignForm.controls['videoUpload'].updateValueAndValidity();
    }
  }

  goToFormCampaignUsers(campaignId: number) {
    this.router.navigate(['brand/formCampaignUsers'], { queryParams: { campaignId: campaignId } });
  }
}
