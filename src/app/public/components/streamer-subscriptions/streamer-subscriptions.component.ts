import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { PublicService } from '../../public.service';

@Component({
  selector: 'app-streamer-subscriptions',
  templateUrl: './streamer-subscriptions.component.html',
  styleUrls: ['./streamer-subscriptions.component.scss']
})
export class StreamerSubscriptionsComponent implements OnInit {

  top10StreamerList = [];
  notRewardedSubscriptions: number;
  rewardedSubscriptions: number;
  totalSubscriptions: number;

  constructor(private utilityService: UtilityService,
    public publicService: PublicService,
    public router: Router) { }

  async ngOnInit() {
    await this.showStreamerSubscriptions();
  }

  async showStreamerSubscriptions() {
    this.utilityService.showLoading();
    try {
      const response: any = await this.publicService.showStreamerSubscriptions();
      if (response.success) {
        this.utilityService.hideLoading();
        this.top10StreamerList = response.data.top_streamers;
        this.notRewardedSubscriptions = response.data.not_rewarded_subs;
        this.rewardedSubscriptions = response.data.rewarded_subs[0].rewarded_subs;
        this.totalSubscriptions = response.data.total_subs[0].total_subs;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedFetchProfileData');
      this.utilityService.hideLoading();
    }
  }

  goToRegistration() {
    this.router.navigate(['/user/registration']);
  }
}

