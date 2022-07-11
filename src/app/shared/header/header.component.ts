import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { HeaderService } from '../services/header.service';
import { AccountDetail, CompanyInformation, UserCoinsData } from '../models/shared.model';
import { UserService } from 'src/app/user/services/user.service';
import { BrandProfileData } from '../../brand/models/profile.model';
import { BrandService } from 'src/app/brand/services/brand.service';
import { RedeemRewardsParameters, RedeemRewardsRequestParameters, UserProfileData, UserProfileInformation } from '../../user/models/profile.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { UtilityService } from '../services/utility.service';
import { SocialAuthService } from 'angularx-social-login';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isShown: boolean = false;
  switchLanguage: string = 'es';
  pageName: string = '';
  pageNameWithoutParameters: string = '';
  isLoggedIn: boolean = false;
  accountDetail: AccountDetail;
  totalCoins: number = 0;
  companyInfo: CompanyInformation;
  userInfo: UserProfileInformation;
  userFirstName: any;
  userLastName: any;

  constructor(
    public headerService: HeaderService,
    public translateService: TranslateService,
    public userService: UserService,
    public authService: AuthService,
    public brandService: BrandService,
    public router: Router,
    public utilityService: UtilityService,
    private socialAuthService: SocialAuthService
  ) {
    this.headerService.switchLanguage.subscribe(res => {
      this.switchLanguage = res;
      translateService.setDefaultLang(res);
      translateService.use(res);
      const loginDetail: any = window.localStorage.getItem('loginDetail');
      if (loginDetail) {
        this.accountDetail = JSON.parse(loginDetail);
        this.isLoggedIn = true;
        if (this.authService.getLoggedInUserDetail().user_info.user_type === '2') {
          this.getTotalCoinsOfUser();
          this.userFirstName = (this.authService.getLoggedInUserDetail()).user_info.first_name;
          this.userLastName = (this.authService.getLoggedInUserDetail()).user_info.last_name;
        }
        if (this.authService.getLoggedInUserDetail().user_info.user_type === '3') {

        }
      }
    });

    // Get page name
    this.headerService.pageName.subscribe(res => {
      this.isShown = false;
      this.pageName = res;
      this.pageNameWithoutParameters = '';
      if (this.pageName.startsWith('/brand/createCampaignTabs')) {
        this.pageNameWithoutParameters = '/brand/createCampaignTabs';
      }
      if (this.pageName.startsWith('/admin/user-details')) {
        this.pageName = '/admin/users';
      }
      if (this.pageName.startsWith('/admin/brands-details')) {
        this.pageName = '/admin/brands';
      }
      if (this.pageName.startsWith('/brand/myCampaign')) {
        this.pageName = '/brand/myCampaign';
      }
    })

    // selected language
    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.switchLanguage = res;
        if (this.router.url.includes('policies')) {
          this.router.navigate(['policies-es'], { queryParams: { policies: this.router.url.split('=')[1] } });
        }
      } else {
        this.switchLanguage = '';
        if (this.router.url.includes('policies')) {
          this.router.navigate(['policies'], { queryParams: { policies: this.router.url.split('=')[1] } });
        }
      }
    })
  }
  async ngOnInit() {
    // To prevent user to get into inspect element
    // $(document).on("contextmenu",function(e) {
    //   e.preventDefault();
    // });

    //  document.addEventListener('keydown', (e) => {
    //    console.log('ee', e);

    //     if(e.code === 'F12' || e.code === 'ShiftLeft' || e.code === 'KeyI'){
    //       e.preventDefault();
    //       return false;
    //     }
    //  });

    // complete code to prevent user to get into inspect 
    const loginDetail: any = window.localStorage.getItem('loginDetail');
    if (loginDetail) {
      this.accountDetail = JSON.parse(loginDetail);
      this.isLoggedIn = true;
      if (this.authService.getLoggedInUserDetail().user_info.user_type === '2') {
        this.getTotalCoinsOfUser();
        const response: UserProfileData = await this.userService.getProfile();
        if (response.success) {
          this.userFirstName = response.data.user_info.first_name;
          this.userLastName = response.data.user_info.last_name;
        }
      }
      if (this.authService.getLoggedInUserDetail().user_info.user_type === '3') {

      }
      if (this.authService.getLoggedInUserDetail().user_info.user_type === '1') {
        const response: BrandProfileData = await this.brandService.getBrandProfile();
        if (response.success) {
          this.companyInfo = response.data.company_info;

          var dateTimeStreamp = response.datetime * 1000;
          var date = new Date(dateTimeStreamp).toLocaleDateString("en-us");
        }
      }
    }
    this.headerService.subsribeToCoinUpdate({
      next: async (task: string) => {
        if (task == 'task completed') {
          await this.getTotalCoinsOfUser();
        }
      }
    });
  }
  goToHowitWorks(HowitWorks: string) {
    // this.router.navigate(['home'], { queryParams: { section: HowitWorks }});
    this.router.navigate(['howItWorks']);
  }
  selectLanguage(language: string) {
    this.headerService.switchLanguage.next(language);
    localStorage.setItem('selectedLanguage', language);
  }

  async getTotalCoinsOfUser() {
    try {
      const response: UserCoinsData = await this.userService.getTotalCoinsOfUser();
      if (response.success) {
        this.totalCoins = response.data.wallet_balance;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      this.utilityService.showErrorToast(error.message);
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.socialAuthService.signOut();
    this.authService.logout();
    setTimeout(() => {
      location.reload();
    }, 300);
  }

  sideMenuHide() {
    let element = document.getElementById("navbarTogglerDemo03");

    if (element) {
      element.classList.remove("show");
    }

  }

  goToStreamerSubscriptionsPage() {
    // this.router.navigate(['home'], { queryParams: { section: HowitWorks }});
    this.router.navigate(['streamersSubscriptions']);
  }
}
