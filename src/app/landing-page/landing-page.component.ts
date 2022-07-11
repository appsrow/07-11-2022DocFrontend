import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../shared/services/auth.service';
import { UtilityService } from '../shared/services/utility.service';
import { UserService } from '../user/services/user.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  isShow!: boolean;
  topPosToStartShowing = 100;
  sectionHowitWorks: any;
  modalReference!: NgbModalRef;
  closeModal!: string;
  isFBIframeLoaded: boolean = false;
  referralName: string;
  access_token: string;

  @HostListener('window:scroll')
  checkScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private modalService: NgbModal,
    private utilityService: UtilityService,
    private userService: UserService,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.referralName = params.ref;
      if (this.referralName) {
        // check if the referral link is a valid refferal link
        this.checkReferralLink(this.referralName);
      }

      this.sectionHowitWorks = params.section;
      if (this.sectionHowitWorks === "HowitWorks") {
        setTimeout(() => {
          var worksSection: any = document.getElementById("section-tasks");
          window.scroll({
            top: worksSection.offsetTop,
            behavior: 'smooth'
          });
        }, 200);
      }
      else {
        setTimeout(() => {
          window.scroll({
            top: 95,
            behavior: 'smooth'
          });
        }, 200);
      }
    })
  }

  goToUserTask() {
    if (this.authService.isLoggedIn && this.authService.getLoggedInUserDetail().user_info.user_type === '2') {
      this.router.navigate(['user/userTasks']);
    } else {
      this.router.navigate(['user/login']);
    }
  }

  goToNewCampaign() {
    if (this.authService.isLoggedIn && this.authService.getLoggedInUserDetail().user_info.user_type === '1') {
      this.router.navigate(['brand/campaignTarget']);
    } else {
      this.router.navigate(['brand/login']);
      this.router.navigate(['brand/login'], { queryParams: { page: 'campaignTarget' } });
    }
  }

  triggerModal(content: any) {
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
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

  async checkReferralLink(referralName: string) {
    const requestBody: any = {
      'streamer_name': referralName
    }
    try {
      this.utilityService.showLoading();
      const response: any = await this.userService.checkReferralLink(requestBody);

      if (response.success) {
        this.utilityService.hideLoading();
        localStorage.setItem('referralStreamerName', this.referralName);
        this.router.navigate(['user/registration'], { queryParams: { ref: this.referralName } });
      } else {
        this.utilityService.showErrorToast(response.message);
        this.utilityService.hideLoading();
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  // async getInstaAuthorizationCode(code: string) {
  //   const requestBody: any = {
  //     'code': code
  //   }
  //   try {
  //     this.utilityService.showLoading();
  //     const response: any = await this.userService.instaAuth(requestBody);
  //     if (response.success) {
  //       this.access_token = response.data.access_token;
  //       this.utilityService.hideLoading();
  //       this.getInstaProfile(this.access_token);
  //     } else {
  //       this.utilityService.showErrorToast(response.data.error_message);
  //       this.utilityService.hideLoading();
  //       this.router.navigate(['/home']);
  //     }
  //   } catch (error) {
  //     this.utilityService.hideLoading();
  //   }
  // }

  // async getInstaProfile(access_token: string) {
  //   console.log('access_token', access_token);
  //   const requestBody: any = {
  //     'access_token': access_token
  //   }
  //   try {
  //     this.utilityService.showLoading();
  //     const response: any = await this.userService.getInstaProfile(requestBody);
  //     if (response.success) {
  //       console.log('response', response);
  //       this.utilityService.hideLoading();
  //       localStorage.setItem('InstaUserName', response.data.username);
  //       this.storeInstagramData(response.data.username);
  //       // this.router.navigate(['user/userTasks']);
  //       // alert('Hello' + response.data.username);
  //     } else {
  //       this.utilityService.showErrorToast(response.data.error_message);
  //       this.utilityService.hideLoading();
  //       this.router.navigate(['/home']);
  //     }
  //   } catch (error) {
  //     this.utilityService.hideLoading();
  //   }
  // }

  // async storeInstagramData(instagramUserName: string) {
  //   const requestBody: any = {
  //     'campaign_id': 50,
  //     'user_id': this.authService.getLoggedInUserDetail().user_info.id,
  //     'user_instagram_account': instagramUserName,
  //     'brand_instagram_account': instagramUserName
  //   }
  //   try {
  //     this.utilityService.showLoading();
  //     const response: any = await this.userService.saveInstagramData(requestBody);
  //     if (response.success) {
  //       this.utilityService.hideLoading();
  //       // open brand profile
  //       window.open('https://www.instagram.com/jewlery_store_1/');
  //     } else {
  //       this.utilityService.showErrorToast(response.data.error_message);
  //       this.utilityService.hideLoading();
  //       this.router.navigate(['/home']);
  //     }
  //   } catch (error) {
  //     this.utilityService.hideLoading();
  //   }
  // }

  // async goToBrandProfile() {
  //   window.open('https://www.instagram.com/jewlery_store_1/');
  // }

}
