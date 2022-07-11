import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { RedeemRewardsParameters, RedeemRewardsRequestParameters, UserProfileData, UserProfileInformation } from '../../models/profile.model';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  userInfo: UserProfileInformation;
  userAlreadyRedeemRewards: RedeemRewardsParameters[];
  country: string = '';
  state: string = '';
  profilePicture: string = '';
  alreadyRedeemed: boolean = false;
  showLoadMoreButton: boolean = false;
  showAllRewards = 6;
  showProfile: boolean = false;

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.getProfile();
    this.getAlreadyReedeemRewards();
  }

  async getProfile() {
    this.utilityService.showLoading();
    try {
      const response: UserProfileData = await this.userService.getProfile();
      if (response.success) {
        this.showProfile = true;
        this.utilityService.hideLoading();
        this.userInfo = response.data.user_info;
        response.data.country_name ? this.country = response.data.country_name : '';
        response.data.state_name ? this.state = response.data.state_name : '';
        response.data.user_photo ? this.profilePicture = response.data.user_photo : '';
      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedFetchProfileData');
      this.utilityService.hideLoading();
    }
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
          if (this.userAlreadyRedeemRewards.length > 6) {
            this.showLoadMoreButton = true;
          }
          
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
  loadMoreReword() {
    this.showLoadMoreButton = false;
    this.showAllRewards = this.userAlreadyRedeemRewards.length;
  }
}
