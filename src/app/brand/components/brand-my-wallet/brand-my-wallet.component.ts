import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { WalletDetailData } from '../../models/wallet.model';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-brand-my-wallet',
  templateUrl: './brand-my-wallet.component.html',
  styleUrls: ['./brand-my-wallet.component.scss']
})
export class BrandMyWalletComponent implements OnInit {

  error: string = '';
  walletBalance: number = 0;
  brandCampaignDetails: any;
  walletpercentage: number = 0;
  isbrandDetailsNull: boolean = false;
  public searchInput: string = '';

  constructor(public utilityService: UtilityService,
    private toastr: ToastrService,
    private brandService: BrandService,
    private router: Router) { }

  ngOnInit(): void {
    this.getBrandWalletDetails();
  }

  async getBrandWalletDetails(){
    this.utilityService.showLoading();
    try{
      const response: WalletDetailData = await this.brandService.getBrandWalletDetails();

      if (response.success){
        if(response.message == null){
          this.isbrandDetailsNull = true;
          this.brandCampaignDetails = [];
        }else{
          this.walletBalance = response.data.my_balance;
          this.brandCampaignDetails = response.data.campaigns;
        }
        this.utilityService.hideLoading();
      }else{
        this.error = response.message;
        this.utilityService.hideLoading();
      }
    }catch(error){
      this.utilityService.showErrorToast('toast.failedFetchWalletDetails');
      this.utilityService.hideLoading();
    }
  }

  goToMyCampaigns(){
    this.router.navigate(['brand/myCampaign']);
  }

  goToCampaignStatistics(campaignId: number){
    this.router.navigate(['brand/statistics'], { queryParams: { campaignId: campaignId }});
  }
}
