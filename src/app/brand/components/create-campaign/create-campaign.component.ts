import { Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { DatepickerOptions } from 'ng2-datepicker';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandService } from '../../services/brand.service';
import { CampaignPosition, CampaignTargetInfo, getCampaignPositionRequestParameters, getHighestCacRequestParameters, HighestCacResponse } from '../../models/campaign.model';
import * as moment from 'moment';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Country } from 'src/app/user/models/registration.model';
import { UserService } from 'src/app/user/services/user.service';
import { HeaderService } from 'src/app/shared/services/header.service';

@Component({
  selector: 'app-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.scss']
})

export class CreateCampaignComponent implements OnInit {
  @Input() selectedTarget: CampaignTargetInfo = { id: '', name: '', apiCampaignName: '', campaignDisplayName: '', icon: '', socialLink: '' };

  campaigntarget: any;
  campaignId: any;
  minCAC: any;
  campaignImage: any;
  videoUrl: any;
  date = new Date();
  createCampaignForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  error = '';
  videoSizeError = '';
  imageError = '';
  createdBrandId: any;
  showupdateButton: boolean = false;
  createdCampaignId: any;
  campaignTypeImage: string = '/assets/images/lead.png';
  campaignTypeName: string = 'Lead';
  selectedSocialMediaLinkLabel: string = 'Twitter link';
  uploadedVideoShow: string = '';
  usersTarget: number = 0;
  //minDate = moment().subtract(1, "days");
  maxDate = moment().toDate();
  socialMedia = [] as any;
  isBudgetReadOnly: boolean = false;
  isProductInformationReadOnly: boolean = false;
  isVideoReadOnly: boolean = false;
  isSocialMediaLinkReadOnly: boolean = false;
  isAppDownloadLinkReadOnly: boolean = false;
  isWebisteVisitLinkReadOnly: boolean = false;
  isSocialSelectDisable: boolean = false;
  genderList: any = [];
  videoTypeSelection: any = [];
  selectedGenders: any = [];
  dropdownSettings = {};
  dropdownVideoSettings = {};
  modalContent: any;
  modalReference!: NgbModalRef;
  closeModal!: string;
  taxPercentage: string = '';
  countries: any;
  campaignType: string = '';
  maximumCac: string = '';
  campaignInformation: any = {};
  serverDate: any;
  serverDateFormate: any;
  showYoutubeVideoInput: boolean = false;
  showVideoInput: boolean = false;
  @ViewChild('createCampaignComponent') createCampaignComponent!: CreateCampaignComponent;
  @Output('increaseCampaignStep') increaseCampaignStep: EventEmitter<any> = new EventEmitter<any>();
  @Output('createdNewlyBrandId') createdNewlyBrandId: EventEmitter<any> = new EventEmitter<any>();
  @Input() questionsFormData: any;

  constructor(private formBuilder: FormBuilder,
    private brandService: BrandService,
    private authService: AuthService,
    public utilityService: UtilityService,
    private modalPopupService: NgbModal,
    private userService: UserService,
    private headerService: HeaderService) { }
  startDate: DatepickerOptions = {};
  endDate: DatepickerOptions = {};
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
    // console.log('CreateCampaignQuestionsFormData', this.questionsFormData);

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
      sociallink: [],
      socialMedia: [],
      websitelink: [],
      videoUpload: [''],
      campaignPosition: [],
      totalAmount: [],
      selectedCountries: [[{ id: 207, itemName: 'Spain' }]],
      selectedGenders: [[]],
      fromAge: [],
      toAge: [],
      youtubeVideoUrl: [],
      selectedVideoType: ['']
    });
    this.socialMedia = this.getSocialMediaList();
    this.createCampaignForm.controls.socialMedia.patchValue(this.socialMedia[0].id);
    this.taxPercentage = environment.taxPercentage;

    this.createCampaignForm.valueChanges.subscribe(() => {
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

      // Information we are accessing from another page
      this.campaignInformation = {
        "campaign_name": this.createCampaignForm.value.campaignName,
        "goal_of_campaign": this.createCampaignForm.value.goalOfCampaign,
        "start_date": moment(this.createCampaignForm.value.startDate).format('YYYY-MM-DD'),
        "end_date": moment(this.createCampaignForm.value.endDate).format('YYYY-MM-DD'),
        "product_information": this.createCampaignForm.value.productInformation,
        "campaign_type": this.selectedTarget.apiCampaignName,
        "campaign_type_name": this.selectedTarget.name,
        "user_id": this.authService.getAccessToken().user_info.id,
        "campaign_image": this.createCampaignForm.value.campaignImage,
        "sub_total": this.createCampaignForm.value.totalBudget,
        "tax_value": this.taxPercentage,
        "country": selectedCountries.toString(),
        "start_age": this.createCampaignForm.value.fromAge,
        "end_age": this.createCampaignForm.value.toAge,
        "gender": selectedGenders.toString(),
        "cac": this.createCampaignForm.value.CAC,
        "total_budget": this.createCampaignForm.value.totalBudget,
        "coins": this.createCampaignForm.value.coins,
        "user_target": this.createCampaignForm.value.usersTarget,
        "campaign_position": this.createCampaignForm.value.campaignPosition,
        "uploaded_video_url": this.createCampaignForm.value.videoUpload,
        "selected_social_media_name": (this.selectedTarget.name === 'Follow') ? this.createCampaignForm.value.socialMedia : '',
        "selected_social_media_url": this.createCampaignForm.value.sociallink,
        "app_download_link": this.createCampaignForm.value.downloadLink,
        "website_url": this.createCampaignForm.value.websitelink,
        "youtube_video_url": this.createCampaignForm.value.youtubeVideoUrl
      };
    });

    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.genderList = [
          { "id": 1, "itemName": "Masculino" },
          { "id": 2, "itemName": "Mujer" },
          { "id": 3, "itemName": "Otro" }
        ];
        this.videoTypeSelection = [
          { "id": 1, "itemName": "Subir vídeo" },
          { "id": 2, "itemName": "Ingrese la URL de YouTube" }
        ];
      } else {
        this.genderList = [
          { "id": 1, "itemName": "Male" },
          { "id": 2, "itemName": "Female" },
          { "id": 3, "itemName": "Other" }
        ];
        this.videoTypeSelection = [
          { "id": 1, "itemName": "Upload video" },
          { "id": 2, "itemName": "Youtube video link" }
        ];
      }
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
    const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
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
      this.createCampaignForm.controls.startDate.valueChanges.subscribe(x => {
        this.endDate.minDate = x;
        this.endDate = {
          format: 'dd-MM-yyyy',
          placeholder: '',
          minDate: x
        };
      });
      this.createCampaignForm.controls.endDate.valueChanges.subscribe(x => {
        this.startDate = {
          format: 'dd-MM-yyyy',
          placeholder: '',
          minDate: new Date(this.serverDateFormate),
          maxDate: x
        };
      });
    }, 2000);
    if (this.selectedTarget.name == 'uploadvideo') {
      this.createCampaignForm.get('selectedVideoType')?.setValidators([Validators.required]);
    }

    if (this.selectedTarget.name == 'Follow') {
      const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.controls['sociallink'].setValidators([Validators.required, Validators.pattern(twitterRegex)]);
    }


    if (this.selectedTarget.name == 'Appsdownload') {
      this.createCampaignForm.controls['downloadLink'].setValidators([Validators.required, Validators.pattern(linkRegex)]);
    }

    if (this.selectedTarget.name == 'clicksonthewebsite') {
      this.createCampaignForm.controls['websitelink'].setValidators([Validators.required, Validators.pattern(linkRegex)]);
    }


    await Promise.all([
      this.getMinimumCAC(this.selectedTarget.id),
      this.getMaximumCacByCampaignType(this.selectedTarget.name),
      this.getCountries()
    ]);

  }

  onItemSelect(item: any) { }

  OnItemDeSelect(item: any) { }

  onSelectAll(items: any) { }

  onDeSelectAll(items: any) { }

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

  onVideoTypeDeSelect(item: any) {
  }

  onSelectCampaignImage(event: any) {
    const file: File = event.target.files[0];
    if (file.size === 0 || (file.size / 1000) > 500) {
      this.headerService.switchLanguage.subscribe(res => {
        if (res == 'es') {
          this.imageError = 'El tamaño de la imagen no debe superar los 500 KB';
        } else {
          this.imageError = 'Image size should not greater than 500 KB';
        }
      });
      return this.imageError;
    }
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let filePath = file.name;
      let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
      if (!allowedExtensions.exec(filePath)) {
        this.headerService.switchLanguage.subscribe(res => {
          if (res == 'es') {
            this.imageError = 'La imagen debe estar en formato PNG o JPG.';
          } else {
            this.imageError = 'Image should be in PNG or JPG format';
          }
        });
        return this.imageError;
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

  onChangeEvent(event: any) {
    let cac = this.createCampaignForm.value.CAC;
    let total_budget = this.createCampaignForm.value.totalBudget;

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
  }

  delete(): void {
    this.createCampaignForm.controls.campaignImage.setValue('');
    this.campaignImage = '';
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
          this.headerService.switchLanguage.subscribe(res => {
            if (res == 'es') {
              this.videoSizeError = 'Extensión de video no válida. Solo se permiten las extensiones de video .mp4, .mpeg, .mpeg2, .mpeg4';
            } else {
              this.videoSizeError = 'Not valid video extension. Only .mp4, .mpeg, .mpeg2, .mpeg4 video extensions are allowed';
            }
          });
          this.submitted = false;
          return this.videoSizeError;
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
      this.headerService.switchLanguage.subscribe(res => {
        if (res == 'es') {
          this.videoSizeError = 'El tamaño del video no es válido. Cargue un tamaño que no supere los 13 MB.';
        } else {
          this.videoSizeError = 'Video size not valid. Please upload size no longer than 13mb.'
        }
      });
      this.submitted = false;
      return this.videoSizeError;
      // Swal.fire({
      //   type: 'error',
      //   title: 'Please upload a file with a valid file size. No larger than 1mb. Please upload another file.',
      //   showConfirmButton: false,
      //   timer: 2000
      // })
    }
  }

  async getMinimumCAC(targetId: string) {

    const campaignTargetData: { target_id: string } = {
      'target_id': targetId
    }
    this.utilityService.showLoading();
    try {
      const response = await this.brandService.getMinimumCAC(campaignTargetData);
      if (response.success) {
        this.minCAC = response.data.target_subtype[0].minimum_cac;
        this.serverDate = new Date(response.datetime * 1000);
        this.serverDateFormate = moment(this.serverDate).subtract(1, "days");
        if (this.minCAC) {
          this.createCampaignForm.controls.CAC.setValue(this.minCAC);
          this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        }
      } else {
        this.error = response.message;
      }
    } catch (error) {
      console.log(error);
    }
    this.utilityService.hideLoading();
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
        this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(youtubeRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Youtube link';
      }
      if (selectedSocialMedia == 'instagram') {
        const linkRegex = "^(https://(www.)?instagram.com/)(user|c|channel)/.{3,}.*";
        this.minCAC = res.data.target_subtype[1].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        // this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
        this.createCampaignForm.get('sociallink')?.setValidators([Validators.required]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Instagram link';
      }
      if (selectedSocialMedia == 'twitter') {
        const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
        this.minCAC = res.data.target_subtype[0].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Twitter link';
      }
      if (selectedSocialMedia == 'twitch') {
        const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
        this.minCAC = res.data.target_subtype[2].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Twitch link';
      }
      if (selectedSocialMedia == 'Select social media') {
        const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
        this.minCAC = res.data.target_subtype[0].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
        this.selectedSocialMediaLinkLabel = 'Social media link';
      }
      if (selectedSocialMedia == 'facebook') {
        const facebookRegex = '^(https://(www.)?facebook.com/)(([a-zA-Z0-9_]+){3,})';
        this.minCAC = res.data.target_subtype[4].minimum_cac;
        this.createCampaignForm.controls.CAC.setValue(this.minCAC);
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(facebookRegex)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
        this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
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
        this.createCampaignForm.controls.campaignPosition.setValue(0);
        throw new Error(response.message);
      }
    } catch (error) {
      // this.utilityService.showErrorToast('toast.failedGetCampaignPosition');
      this.utilityService.hideLoading();
    }
  }

  getSocialMediaList() {
    return [
      { id: 'twitter', name: 'Twitter' },
      // { id: 'instagram', name: 'Instagram' },
      // { id: 'twitch', name: 'Twitch' },
      { id: 'youtube', name: 'Youtube' },
      { id: 'facebook', name: 'Facebook' },
      { id: 'instagram', name: 'Instagram' }
    ];
  }

  isClicked() {
    this.createCampaignForm.controls.videoUpload.setValue('');
  }

  getSocialMedia(socialMediaName: string) {
    let selectedSocialMedia = socialMediaName;
    if (selectedSocialMedia == 'youtube') {
      const youtubeRegex = '^(https://(www.)?youtube.com/)(user|c|channel)/.{3,}.*';
      this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(youtubeRegex)]);
      this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Youtube link';
    }
    if (selectedSocialMedia == 'instagram') {
      const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
      this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
      this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Instagram link';
    }
    if (selectedSocialMedia == 'twitter') {
      const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
      this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Twitter link';
    }
    if (selectedSocialMedia == 'twitch') {
      const linkRegex = "((http|https)://)(www.)?" + "[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]" + "{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
      this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(linkRegex)]);
      this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Twitch link';
    }
    if (selectedSocialMedia == 'Select social media') {
      const twitterRegex = '^(https://(www.)?twitter.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(twitterRegex)]);
      this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Social media link';
    }
    if (selectedSocialMedia == 'facebook') {
      const facebookRegex = '^(https://(www.)?facebook.com/)(([a-zA-Z0-9_]+){3,})';
      this.createCampaignForm.get('sociallink')?.setValidators([Validators.required, Validators.pattern(facebookRegex)]);
      this.createCampaignForm.controls['sociallink'].updateValueAndValidity();
      this.selectedSocialMediaLinkLabel = 'Facebook link';
    }
  }

  deleteVideo() {
    this.uploadedVideoShow = '';
    this.createCampaignForm.controls.videoUpload.setValue('');
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
          this.maximumCac = response.data[0].max_cac != null ? `${response.data[0].max_cac}.` : '';
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedToUpdate');
        this.utilityService.hideLoading();
      }
    }
  }

  removeCacValidationOnPrevious(socialMediaName: string) {

    if (socialMediaName === 'youtube' || socialMediaName === 'facebook') {
      const campaignTargetData = {
        'target_id': '3'
      }

      return this.brandService.getMinimumCAC(campaignTargetData).then(res => {
        this.minCAC = res.data.target_subtype[0].minimum_cac;
        if (socialMediaName == 'youtube') {
          const youtubeRegex = '^(https://(www.)?youtube.com/)(user|c|channel)/.{3,}.*';
          this.minCAC = res.data.target_subtype[3].minimum_cac;
        }

        if (socialMediaName == 'facebook') {
          this.minCAC = res.data.target_subtype[4].minimum_cac;
        }
        this.createCampaignForm.get('CAC')?.setValidators([Validators.min(this.minCAC)]);
        this.createCampaignForm.controls['CAC'].updateValueAndValidity();
      });
    }
  }
}
