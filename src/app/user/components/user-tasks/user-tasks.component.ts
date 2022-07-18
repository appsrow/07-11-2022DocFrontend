import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/shared/services/login.service';
import { UserService } from '../../services/user.service';
import { CompleteTaskData, CompleteTaskRequestParameters, CampaignClickedParameters, CampaignClickedData, Rewards, RewardsRequestParameters, Task, TaskDetail, TaskParameters, twitterAuthDetails, twitterAuth2Parameters, twitterAuth2, RewardsDetail } from '../../models/user-task.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { HeaderService } from 'src/app/shared/services/header.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Country, RequestSmsRequestData, RequestSmsResponseData, VerifyCodeRequestData } from '../../models/registration.model';
import { Config } from 'ng-otp-input/lib/models/config';
import { ShowQuestionsComponent } from '../show-questions/show-questions.component';
declare var gapi: any;
declare const gtag: Function;

@Component({
  selector: 'app-user-tasks',
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})

export class UserTasksComponent implements OnInit {
  agree: boolean = false;
  modalContent: TaskDetail;
  closeModal!: string;
  allTasks: TaskDetail[] = [];
  leadTasks: TaskDetail[] = [];
  downloadTasks: TaskDetail[] = [];
  followTasks: TaskDetail[] = [];
  videoTasks: TaskDetail[] = [];
  visitTasks: TaskDetail[] = [];
  formTasks: TaskDetail[] = [];
  allcompletedTasks: TaskDetail[] = [];
  modalReference!: NgbModalRef;
  modalReference2!: NgbModalRef;
  result = '';
  url: string = '';
  FBUrl!: SafeResourceUrl;
  showAllTasks = 8;
  showLeadTasks = 8;
  showDownloadTasks = 8;
  showFollowTasks = 8;
  showVideoTasks = 8;
  showVisitTasks = 8;
  showFormTasks = 8;
  showLoadMoreButtonAllTasks: boolean = false;
  showLoadMoreButtonLeadTasks: boolean = false;
  showLoadMoreButtonDownloadTasks: boolean = false;
  showLoadMoreButtonFollowTasks: boolean = false;
  showLoadMoreButtonVideoTasks: boolean = false;
  showLoadMoreButtonVisitTasks: boolean = false;
  completedTaskButton: boolean = false;
  twitterUrl: any;
  campaign_id: any;
  campaign_type: any;
  showModel: boolean = false;
  selectedType: string = 'all';
  timeDuration: string = '';
  periodSkipped: number;
  fbIframeLoadCount: number = 0;
  isFBIframeLoaded: boolean = false;
  noTask: boolean = false;
  noTaskComplted: boolean = false;
  rewards: RewardsDetail[];
  showPendingTasks: boolean;
  isTaskCompleted: boolean = false;
  title = 'dummyApp-YTIFrameAPI';
  showHtmlVideo: boolean = true;
  currentPlayTime: any;
  pauseTime: any;
  userPhoneVerificationForm: FormGroup;
  submittedPhone: boolean = false;
  submittedPhoneCode: boolean = false;
  countriesDialingCodes: any;
  countriesDialingCodesSettings = {};
  closeResult = '';
  phoneNumber: string;
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
  showInstaButton: boolean = true;
  instaProfileName: any = '';
  brandInstagramProfileLink: string;
  //phoneNumberVerfied: Boolean = false;
  instaUrlCode: string;
  access_token: string;
  encryptedCampaignId: string;
  @ViewChild('showQuestonsComponent') showQuestonsComponent!: ShowQuestionsComponent;


  /* 1. Some required variables which will be used by YT API*/
  public YT: any;
  public video: any;
  public player: any;
  public reframed: Boolean = false;
  myWindow: any = window;

  /* 2. Initialize method for YT IFrame API */
  init() {
    // Return if Player is already created
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


  constructor(
    config: NgbModalConfig,
    private userService: UserService,
    public headerService: HeaderService,
    public loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private authService: AuthService,
    public utilityService: UtilityService,
    public sanitizer: DomSanitizer,
    public elementRef: ElementRef,
    private formbuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.instaUrlCode = params.code;

      if (this.instaUrlCode) {
        this.getInstaAuthorizationCode(this.instaUrlCode);
      }
    });
    await this.getCountryDialingCodes();
    await this.getTasksList();
    await this.getRewards();
    await this.getcompletedTasksList();
    //this.getInstaData();

    this.instaProfileName = localStorage.getItem('InstaUserName');
    if (this.instaProfileName) {
      console.log('showInstaButton false');
      this.showInstaButton = false;
    }


    this.userPhoneVerificationForm = this.formbuilder.group({
      phone: ['', [Validators.required]],

      selectedCountryDialingCode: ['', [Validators.required]]
    });
    if (this.route.snapshot.queryParams['oauth_token'] && this.route.snapshot.queryParams['oauth_verifier']) {
      this.twitterUrl = localStorage.getItem("selected_social_media_url");
      this.campaign_id = localStorage.getItem('campaign_id');
      this.campaign_type = localStorage.getItem('campaign_type');
      var twitterPageName = new URL(this.twitterUrl).pathname;
      var gettwitterPageName = twitterPageName.split("/").pop();
      var oauth_token = this.route.snapshot.queryParams['oauth_token'];
      var oauth_verifier = this.route.snapshot.queryParams['oauth_verifier'];

      const Data: twitterAuth2Parameters = {
        campaign_id: this.campaign_id,
        oauth_token: oauth_token,
        oauth_verifier: oauth_verifier,
        target_screen_name: gettwitterPageName
      };

      try {
        const response: twitterAuth2 = await this.userService.gettwitterAuth2(Data);
        if (response.success) {
          const updateData: CompleteTaskRequestParameters = {
            user_id: this.authService.getLoggedInUserDetail().user_info.id,
            campaign_id: this.campaign_id,
            campaign_type: this.campaign_type
          };
          try {
            const res: CompleteTaskData = await this.userService.completeTask(updateData);
            if (res.success) {
              this.utilityService.hideLoading();
              this.utilityService.showSuccessToast('toast.congratulationsCoinsAddedInWallet');
              window.localStorage.setItem("lastSelectedType", this.selectedType);
              this.showModel = true;
              this.router.navigate(['/user/userTasks']);
              localStorage.removeItem("selected_social_media_url");
              localStorage.removeItem('campaign_id');
              localStorage.removeItem('campaign_type');
            }
            else {
              this.utilityService.hideLoading();
            }
          }
          catch (error) {
            this.utilityService.showErrorToast('toast.failedCompleteTask');
            this.utilityService.hideLoading();
          }
        }
        else {
          this.utilityService.showErrorToast('toast.twitterWrongLink');
        }
      } catch (error) {
        this.utilityService.showErrorToast('toast.twitterWrongLink');
      }

    }
    const selected = window.localStorage.getItem("lastSelectedType");
    if (selected) {
      this.selectedType = selected;
      window.localStorage.removeItem("lastSelectedType");
    }
    this.countriesDialingCodesSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    }
  }
  async getcompletedTasksList() {
    const updateData: TaskParameters = {
      user_id: this.authService.getLoggedInUserDetail().user_info.id,
    }
    const response: Task = await this.userService.getAllCompletedTask(updateData);
    if (response.success) {
      this.allcompletedTasks = response.data;
      if (response.data.length > 0) {
        this.completedTaskButton = true;
      }
      else {
        this.completedTaskButton = false;
      }
    }
  }
  async getTasksList() {
    this.allTasks = [];
    try {
      this.utilityService.showLoading();
      const updateData: TaskParameters = {
        user_id: this.authService.getLoggedInUserDetail().user_info.id,
      }
      const response: Task = await this.userService.getAllTask(updateData);
      if (response.success) {
        this.isTaskCompleted = false;
        this.utilityService.hideLoading();
        this.allTasks = response.data;

        this.leadTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'lead_target');
        this.downloadTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'apps_download');
        this.followTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'follow');
        this.videoTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'video_plays');
        this.visitTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'click_websites');
        this.formTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'questions_form');
        if (this.allTasks.length > 8) {
          this.showLoadMoreButtonAllTasks = true;
        } else {
          this.showLoadMoreButtonAllTasks = false;
        }
        if (this.leadTasks.length > 8) {
          this.showLoadMoreButtonLeadTasks = true;
        }
        if (this.downloadTasks.length > 8) {
          this.showLoadMoreButtonDownloadTasks = true;
        }
        if (this.followTasks.length > 8) {
          this.showLoadMoreButtonFollowTasks = true;
        }
        if (this.videoTasks.length > 8) {
          this.showLoadMoreButtonVideoTasks = true;
        }
        if (this.visitTasks.length > 8) {
          this.showLoadMoreButtonVisitTasks = true;
        }
      }
      else {
        this.utilityService.hideLoading();
        this.noTask = true;
        // const snapshot = this.activatedRoute.snapshot;
        // const params = { ...snapshot.queryParams };
        // return this.router.navigate([], { queryParams: params });
      }
    } catch (error) {
      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.somethingWentWrong');
    }
  }

  async getRewards() {
    const updateData: RewardsRequestParameters = {
      user_id: this.authService.getLoggedInUserDetail().user_info.id
    }
    try {
      this.utilityService.showLoading();
      const response: Rewards = await this.userService.getRewards(updateData);
      if (response.success) {
        this.utilityService.hideLoading();
        this.rewards = response.data.rewards;
      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async triggerModal(content: any, task: TaskDetail, mobileModalContent?: any) {
    this.modalContent = task;
    if (task.campaign_type_name === 'Lead') {
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
    }
    // return false when enter and space key pressed
    document.addEventListener('keydown', (e) => {
      if (e.code == 'Space' || e.code == 'Enter') {
        e.preventDefault();
        return false;
      }
    });
    console.log('here');


    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    // If the task is not completed
    if (this.isTaskCompleted === false) {
      console.log('herdsdsde'); this.campaignClicked();
    }
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  async triggerVideoModal(content: any, task: TaskDetail) {
    this.modalReference.close();
    this.modalContent = task;
    this.modalReference = await this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' })
    // If the task is not completed
    if (this.isTaskCompleted === false) { this.campaignClicked(); }

    if (this.modalContent.uploaded_video_url) {
      const modalContainer: any = this.modalReference;
      const modalElement = modalContainer._windowCmptRef.hostView.rootNodes[0].children[0] as HTMLElement;
      const videoElement = $(modalElement).find('#watch-task-video')[0] as HTMLVideoElement;
      const onTimeUpdate = (event: any) => {
        checkSkipped(event.target.currentTime);
      }

      let prevTime = 0;
      const checkSkipped = (currentTime: any) => {
        const skip = [];
        const skipThershold = 2;
        // user skipped any part of the video
        if (currentTime - prevTime > skipThershold) {
          this.periodSkipped = currentTime - prevTime;
          skip.push({
            periodSkipped: currentTime - prevTime,
            startAt: prevTime,
            endAt: currentTime,
          });
          prevTime = currentTime;
          return skip;
        }

        prevTime = currentTime;
        return false;
      }

      videoElement.addEventListener("timeupdate", onTimeUpdate);
      videoElement.addEventListener("ended", (e) => {
        if (e.type == "ended") {
          if (this.periodSkipped > 0) {
            this.utilityService.showErrorToast('toast.videoForwardedError');
            this.modalReference.close();
            this.periodSkipped = 0;
          }
          else {
            this.completeTask();
          }
        }
      });
      this.modalReference.result.then((res) => {
        this.closeModal = `Closed with: ${res}`;
      },
        (res) => {
          this.utilityService.showErrorToast('toast.closeVideoError');
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        });
    } else {
      this.showHtmlVideo = false;
      this.video = this.modalContent.video_id;
      this.modalReference.result.then((res) => {
        this.closeModal = `Closed with: ${res}`;
      },
        (res) => {
          this.utilityService.showErrorToast('toast.closeVideoError');
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        });
      // Return if Player is already created
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

  iframeLoad(e: any) {
    if (this.isFBIframeLoaded) {
      this.fbIframeLoadCount = this.fbIframeLoadCount + 1;
    }
    if (this.fbIframeLoadCount === 1) {
      this.completeTask();
    }
  }

  triggerModalFollow(content: any, task: any) {
    this.modalContent = task;
    console.log('task', task);

    console.log('this.modalContent', this.modalContent);
    localStorage.setItem('encryptedCampaignId', this.modalContent.id.toString());
    this.encryptedCampaignId = this.modalContent.id.toString();
    localStorage.setItem('brandInstagramProfileLink', task.selected_social_media_url);
    this.brandInstagramProfileLink = task.selected_social_media_url;
    this.isFBIframeLoaded = false;
    this.fbIframeLoadCount = 0;
    this.url = "https://www.facebook.com/plugins/like.php?href=" + this.modalContent.selected_social_media_url + "&layout=button&action=like&size=large&share=false";
    this.FBUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' })
    // If the task is not completed
    if (this.isTaskCompleted === false) { this.campaignClicked(); }
    const modalContainer: any = this.modalReference;
    const modalElement = modalContainer._windowCmptRef.hostView.rootNodes[0].children[0] as HTMLElement;
    setTimeout(() => {
      this.fbIframeLoadCount = 0;
      this.isFBIframeLoaded = true;
    }, 2000);
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  youtubeInitialization(selectedTask: TaskDetail) {
    // gapi.auth2.init({
    //   clientId: environment.googleSignInKey,
    //   scope: environment.youtubeScopeUrl
    // }).then(() => {
    this.utilityService.showLoading();
    return gapi.auth2.getAuthInstance().signIn({
      scope: environment.youtubeScopeUrl
    }).then(() => {
      return gapi.client.load(environment.youtubeApiUrl).then(() => {
        let channelId = '';
        const splittedSocialMediaUrl = selectedTask.selected_social_media_url.split('/');
        if (splittedSocialMediaUrl[3] === 'c' || splittedSocialMediaUrl[3] === 'user') {
          return gapi.client.youtube.channels.list({
            "forUsername": splittedSocialMediaUrl[4]
          }).then((channelDetail: any) => {
            channelId = channelDetail.result.items[0].id;
            this.subscribeToYoutubeChannel(channelId);
          });
        } else if (splittedSocialMediaUrl[3] === 'channel') {
          channelId = splittedSocialMediaUrl[4];
          this.subscribeToYoutubeChannel(channelId);
        } else {
          this.utilityService.showErrorToast('toast.youtubeWrongLink');
        }
      });
    }, (err: any) => {
      this.utilityService.hideLoading();
    });
    // });
  }

  subscribeToYoutubeChannel(channelId: string) {
    return gapi.client.load(environment.youtubeApiUrl).then(() => {
      return gapi.client.youtube.subscriptions.insert({
        "part": [
          "snippet"
        ],
        "resource": {
          "snippet": {
            "resourceId": {
              "kind": "youtube#channel",
              "channelId": channelId
            }
          }
        }
      }).then((response: any) => {
        this.completeTask();
        this.utilityService.hideLoading();
      },
        (err: any) => {
          if (err.result.error.errors[0].message === 'The subscription that you are trying to create already exists.') {
            this.completeTask();
          } else {
            this.modalReference.close();
            this.utilityService.showErrorToast('toast.youtubeWrongLink');
          }
          this.utilityService.hideLoading();
        });
    }, (err: any) => {
      this.utilityService.hideLoading();
    });
  }

  private getDismissReason(reason: any): string {
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
    this.agree = false;
  }

  async campaignClicked() {
    console.log('called');

    const campaignClickedData: CampaignClickedParameters = {
      campaign_id: this.modalContent.id.toString(),
      brand_id: this.modalContent.company_info[0].user_id.toString()
    };

    try {
      await this.userService.campaignClicked(campaignClickedData);
    } catch (error: any) {
      this.utilityService.showErrorToast(error.message);
    }
  }

  async twitterAuth() {
    const response: twitterAuthDetails = await this.userService.gettwitterAuth();
    var linkAuth = response.data.url;
    window.open(linkAuth, "_self");
    localStorage.setItem('selected_social_media_url', this.modalContent.selected_social_media_url);
    localStorage.setItem('campaign_id', this.modalContent.id.toString());
    localStorage.setItem('campaign_type', this.modalContent.campaign_type);

  }
  async closeModelAfterCompletedTask() {
    this.showModel = false;
    await this.getRewards();
    this.headerService.sendCoinUpdateEvent('task completed');
    this.agree = false;
    await this.getTasksList();
    // const snapshot = this.activatedRoute.snapshot;
    // const params = { ...snapshot.queryParams };
    // return this.router.navigate([], { queryParams: params });
  }
  async completeTask() {
    const updateData: CompleteTaskRequestParameters = {
      user_id: this.authService.getLoggedInUserDetail().user_info.id,
      campaign_id: this.modalContent.id.toString(),
      campaign_type: this.modalContent.campaign_type
    };

    if (this.modalContent.campaign_type === 'click_websites') {
      window.open(this.modalContent.website_url, '_blank');
    }
    // if (this.modalContent.campaign_type === 'apps_download') {
    //   window.open(this.modalContent.app_download_link, '_blank');
    // }
    this.utilityService.showLoading();
    try {
      const response: CompleteTaskData = await this.userService.completeTask(updateData);
      if (response.success) {
        this.utilityService.hideLoading();
        this.utilityService.showSuccessToast('toast.congratulationsCoinsAddedInWallet');
        if (response.data.coins) {
          gtag("event", "earn_virtual_currency", {
            virtual_currency_name: "coins",
            value: response.data.coins
          });
        }

        this.modalReference.close();
        this.showModel = true;
        window.localStorage.setItem("lastSelectedType", this.selectedType);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      else {
        this.utilityService.showErrorToast(response.message);
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedCompleteTask');
      this.utilityService.hideLoading();
    }
  }

  goToMyCompletedTasks() {
    this.router.navigate(['/user/completedTasks']);
  }

  loadMoreTask(taskType: string) {
    if (taskType == 'allTasks') {
      this.showLoadMoreButtonAllTasks = false;
      this.showAllTasks = this.allTasks.length;
    }

    if (taskType == 'leadTasks') {
      this.showLoadMoreButtonLeadTasks = false;
      this.showLeadTasks = this.allTasks.length;
    }

    if (taskType == 'downloadTasks') {
      this.showLoadMoreButtonDownloadTasks = false;
      this.showDownloadTasks = this.allTasks.length;
    }

    if (taskType == 'followTasks') {
      this.showLoadMoreButtonFollowTasks = false;
      this.showFollowTasks = this.allTasks.length;
    }

    if (taskType == 'videoTasks') {
      this.showLoadMoreButtonVideoTasks = false;
      this.showVideoTasks = this.allTasks.length;
    }

    if (taskType == 'visitTasks') {
      this.showLoadMoreButtonVisitTasks = false;
      this.showVisitTasks = this.allTasks.length;
    }

    // if (taskType == 'visitTasks') {
    //   this.showLoadMoreButtonVisitTasks = false;
    //   this.showFormTasks = this.allTasks.length;
    // }

  }

  async togglePendingCompleted(event: { checked: any; }) {
    //If any toggle event is triggered
    this.showLoadMoreButtonAllTasks = false;
    this.showLoadMoreButtonLeadTasks = false;
    this.showLoadMoreButtonDownloadTasks = false;
    this.showLoadMoreButtonFollowTasks = false;
    this.showLoadMoreButtonVideoTasks = false;
    this.showLoadMoreButtonVisitTasks = false;
    this.noTaskComplted = false;
    this.noTask = false;
    this.allTasks = [];
    if (event.checked === false) {
      await this.getTasksList();
    } else {
      try {
        this.utilityService.showLoading();
        const updateData: TaskParameters = {
          user_id: this.authService.getLoggedInUserDetail().user_info.id,
        }
        const response: Task = await this.userService.getAllCompletedTask(updateData);
        if (response.success) {
          this.isTaskCompleted = true;

          this.utilityService.hideLoading();
          this.allTasks = response.data;
          this.leadTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'lead_target');
          this.downloadTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'apps_download');
          this.followTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'follow');
          this.videoTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'video_plays');
          this.visitTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'click_websites');

          if (this.allTasks.length > 8) {
            this.showLoadMoreButtonAllTasks = true;
          } else {
            this.showLoadMoreButtonAllTasks = false;
          }
          if (this.leadTasks.length > 8) {
            this.showLoadMoreButtonLeadTasks = true;
          }
          if (this.downloadTasks.length > 8) {
            this.showLoadMoreButtonDownloadTasks = true;
          }
          if (this.followTasks.length > 8) {
            this.showLoadMoreButtonFollowTasks = true;
          }
          if (this.videoTasks.length > 8) {
            this.showLoadMoreButtonVideoTasks = true;
          }
          if (this.visitTasks.length > 8) {
            this.showLoadMoreButtonVisitTasks = true;
          }
        } else {
          this.utilityService.hideLoading();
          this.noTaskComplted = true;
        }
      } catch (error) {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast('toast.failedToFetchTaskList');
      }
    }
  }

  goToAppDownloadLink() {
    if (this.modalContent.campaign_type === 'apps_download') {
      window.open(this.modalContent.app_download_link, '_blank');
    }
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
        playsinline: 1,

      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onError': this.onPlayerError.bind(this),
        'onReady': this.onPlayerReady.bind(this),
      }
    });

  }

  /* 4. It will be called when the Video Player is ready */
  onPlayerReady(event: any) {
    event.target.setVolume(100);
    event.target.playVideo();
    /// Time tracking starting here

    var lastTime = -1;
    var interval = 1000;

    let window = this.myWindow;
    let player = this.player;
    let current = this;

    var checkPlayerTime = function () {
      if (lastTime != -1) {
        if (player.getPlayerState() == window['YT'].PlayerState.PLAYING) {
          current.currentPlayTime = player.getCurrentTime();
        }
      }
      lastTime = player.getCurrentTime();
      setTimeout(checkPlayerTime, interval); /// repeat function call in 1 second
    }
    setTimeout(checkPlayerTime, interval); /// initial call delayed 
  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event: any) {
    switch (event.data) {
      case this.myWindow['YT'].PlayerState.PLAYING:
        if (this.cleanTime() == 0) {
          console.log('started ' + this.cleanTime());
        } else {
          console.log('playing ' + this.cleanTime())
        };
        break;
      case this.myWindow['YT'].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          this.pauseTime = this.cleanTime();
          if (this.currentPlayTime + 1 < this.pauseTime) {
            this.closeVideoWithError();
          }
        };
        break;
      case this.myWindow['YT'].PlayerState.ENDED:
        this.completeTask();
        break;
    };
  };

  cleanTime() {
    return Math.round(this.player.getCurrentTime())
  };

  closeVideoWithError() {
    this.player.stopVideo();
    this.modalReference.close();
    this.utilityService.showErrorToast('toast.videoForwardedError');
  }
  onPlayerError(event: any) {
    switch (event.data) {
      case 2:
        console.log('' + this.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    };
  };

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
        // If the task is not completed open the task modal
        if (this.isTaskCompleted === false) {
          console.log('herdsdsde'); this.campaignClicked();
        }
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

  cancel() {
    this.modalReference.close();
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

  async triggerQuestionsModal(content: any, task: TaskDetail) {
    this.modalReference.close();
    this.modalContent = task;
    this.modalReference = await this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' })
    // If the task is not completed
    if (this.isTaskCompleted === false) { this.campaignClicked(); }

    if (this.modalContent.campaign_type === 'questions_form') {
      this.modalReference.result.then((res) => {
        this.closeModal = `Closed with: ${res}`;
      },
        (res) => {
          this.utilityService.showErrorToast('You have closed the form');
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        });
    }
  }

  openQuestionsForm(campaignId: number) {
    this.modalReference.close();
    this.router.navigate(['/user/showQuestions/' + campaignId]);
    // const url = this.router.serializeUrl(
    //   this.router.createUrlTree(['/user/showQuestions/' + campaignId + ''])
    // );
    // window.open(url);
  }

  async authInsta() {
    // window.open('https://api.instagram.com/oauth/authorize?client_id=333265048755000&redirect_uri=https://dropforcoin.com/&scope=user_profile,user_media&response_type=code');
    // window.open('https://api.instagram.com/oauth/authorize?client_id=301605308829401&redirect_uri=https://coinbase.hcshub.in/user/userTasks&scope=user_profile,user_media&response_type=code');
    window.open('https://api.instagram.com/oauth/authorize?client_id=333265048755000&redirect_uri=https://dropforcoin.com/user/userTasks&scope=user_profile,user_media&response_type=code');
  }

  // getInstaData() {


  //   this.userService.instaAuthorizeObservable.subscribe(response => {
  //     debugger
  //     console.log('getInstaDATA', this.brandInstagramProfileLink);
  //     console.log('subscribe', response);  // you will receive the data from sender component here.
  //     window.open(this.brandInstagramProfileLink);
  //   });

  //   //this.userService.sendInstaData
  // }

  async getInstaAuthorizationCode(code: string) {
    const requestBody: any = {
      'code': code
    }
    try {
      this.utilityService.showLoading();
      const response: any = await this.userService.instaAuth(requestBody);
      if (response.success) {
        this.access_token = response.data.access_token;
        this.utilityService.hideLoading();
        this.getInstaProfile(this.access_token);
      } else {
        //this.utilityService.showErrorToast(response.data.error_message);
        this.utilityService.hideLoading();
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async getInstaProfile(access_token: string) {
    console.log('access_token', access_token);
    const requestBody: any = {
      'access_token': access_token
    }
    try {
      this.utilityService.showLoading();
      const response: any = await this.userService.getInstaProfile(requestBody);
      if (response.success) {
        this.utilityService.hideLoading();
        localStorage.setItem('InstaUserName', response.data.username);
        this.storeInstagramData(response.data.username);
        // this.router.navigate(['user/userTasks']);
        // alert('Hello' + response.data.username);
      } else {
        // this.utilityService.showErrorToast(response.data.error_message);
        this.utilityService.hideLoading();
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async storeInstagramData(instagramUserName: string) {

    console.log('this.modalContent.id.toString()', localStorage.getItem('encryptedCampaignId'));
    let brandInstagramProfileLink = localStorage.getItem('brandInstagramProfileLink') ? localStorage.getItem('brandInstagramProfileLink')?.toString() : 'https://www.instagram.com/payal_vasyani/';

    const requestBody: any = {
      'campaign_id': localStorage.getItem('encryptedCampaignId') ? localStorage.getItem('encryptedCampaignId') : 50,
      'user_id': this.authService.getLoggedInUserDetail().user_info.id,
      'user_instagram_account': instagramUserName,
      'brand_instagram_account': brandInstagramProfileLink
    }
    try {
      this.utilityService.showLoading();
      const response: any = await this.userService.saveInstagramData(requestBody);
      if (response.success) {
        this.utilityService.hideLoading();
        window.open(brandInstagramProfileLink, "_self");
      } else {
        this.utilityService.showErrorToast(response.data.error_message);
        this.utilityService.hideLoading();
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async validateInstaFollow() {
    const requestBody: any = {
      'campaign_id': this.modalContent.id.toString(),
      'user_id': this.authService.getLoggedInUserDetail().user_info.id,
    }
    try {
      this.utilityService.showLoading();
      const response: any = await this.userService.checkInstagramFollow(requestBody);
      if (response.success) {
        this.completeTask();
        localStorage.removeItem('encryptedCampaignId');
        localStorage.removeItem('brandInstagramProfileLink');
      } else {
        this.utilityService.showErrorToast(response.message);
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }
}


