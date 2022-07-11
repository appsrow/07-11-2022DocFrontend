import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompanyInformation, UserInformation } from 'src/app/shared/models/shared.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandProfileData } from '../../models/profile.model';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-brand-profile',
  templateUrl: './brand-profile.component.html',
  styleUrls: ['./brand-profile.component.scss']
})
export class BrandProfileComponent implements OnInit {

  profilePicture: string = '';
  userInfo: UserInformation;
  companyInfo: CompanyInformation;
  isProfileDataLoaded: boolean = false;

  constructor(
    private brandService: BrandService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    this.getBrandProfile();
  }

  async getBrandProfile() {
    this.utilityService.showLoading();
    try {
      const response: BrandProfileData = await this.brandService.getBrandProfile();
      if (response.success) {
        this.utilityService.hideLoading();
        this.userInfo = response.data.user_info;
        this.companyInfo = response.data.company_info;
        response.data.user_photo ? this.profilePicture = response.data.user_photo : '';
        this.isProfileDataLoaded = true;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedFetchProfileData');
      this.utilityService.hideLoading();
    }
  }
}
