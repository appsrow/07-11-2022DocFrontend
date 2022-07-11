import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { DashboardBrandList, DashboardBrandListDetail, DashboardCount, HighestpPaidCampaignsParameters, HighestpPaidCampaignsDetails, HighestpPaidCampaigns } from '../../models/admin.model';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  brandRegistrationForm: FormGroup;
  totalBrands: number = 0;
  totalUsers: number = 0;
  totalFund: number = 0;
  totalSpent: number = 0;
  totalProfit: number = 0;
  registeredBrandData: DashboardBrandListDetail[] = [];
  saleDataMulti: any = [];
  view: any = [innerWidth / 1.1, 400];
  schemeType: any = 'ordinal';
  colorScheme = {
    domain: ['#3f8cff', '#69728d', '#ffff']
  };
  campaignsData: HighestpPaidCampaignsDetails[] = [];
  dropdownSettings = {};
  year: any = [];
  selectedElement: any = [{ itemName: new Date().getFullYear() }];
  date = new Date();
  firstDay = (new Date(this.date.getFullYear(), this.date.getMonth(), 1));
  lastDay = (new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0));
  monthPickerOptions: any = {
    mode: "range",
    dateFormat: 'M-Y',
    defaultDate: [this.firstDay, this.lastDay],
    onChange: (date: any) => {
      if (date.length == 2) {
        this.getHighestPaidCampaigns(moment(date[0]).format('DD-MM-YYYY'), moment(date[1]).format('DD-MM-YYYY'));
      }
    },
    onReady: (date: any) => {
      if (date.length == 2) {
        this.getHighestPaidCampaigns(moment(date[0]).format('DD-MM-YYYY'), moment(date[1]).format('DD-MM-YYYY'));
      }
    }
  };
  constructor(
    private adminService: AdminService,
    public utilityService: UtilityService,
    private router: Router,
    public formBuilder: FormBuilder,
  ) {
    this.brandRegistrationForm = this.formBuilder.group({
      year: [[]],
    });
  }
  ngOnInit(): void {
    var currentYear = new Date().getFullYear();
    for (var i = 2021; i <= currentYear; i++) {
      this.year.push({
        itemName: i,
        id: this.year.length
      });
    }
    this.dropdownSettings = {
      singleSelection: true,
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
    this.getDashboardCount();
    this.getRegisteredBrand(currentYear.toString());
  }

  goToCampaignStatistics(campaignId: number) {
    this.router.navigate(['admin/statistics'], { queryParams: { campaignId: campaignId }});
  }
  onChangeYear(item: any) {
    this.getRegisteredBrand(item.itemName);
  }

  async getDashboardCount() {
    this.utilityService.showLoading();
    try {
      const res: DashboardCount = await this.adminService.getDashboardCount();
      if (res.success) {
        this.utilityService.hideLoading();
        this.totalBrands = res.data.totalBrands;
        this.totalUsers = res.data.totalUsers;
        this.totalFund = res.data.totalFund;
        this.totalSpent = res.data.totalSpent;
        this.totalProfit = res.data.totalProfit;
      }
      else {
        throw new Error(res.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }

  }
  async getRegisteredBrand(yearValue: string) {
    this.utilityService.showLoading();
    try {
      var data = {
        year: yearValue
      }
      const res: DashboardBrandList = await this.adminService.getRegisteredBrands(data.year);
      if (res.success) {
        this.utilityService.hideLoading();
        this.registeredBrandData = res.data;
        this.saleDataMulti = [];
        this.registeredBrandData.forEach((Data: any) => {
          this.saleDataMulti.push({
            "name": Data.Month,
            "series": [
              {
                "name": "Total Brands",
                "value": Data.Count
              }
            ],

          });

        });

      } else {
        this.utilityService.hideLoading();
        throw new Error(res.message);
      }

    }
    catch (error) {
      this.utilityService.hideLoading();
    }

  }
  async getHighestPaidCampaigns(startDate: string, endDate: string) {
    this.utilityService.showLoading();
    try {
      var data: HighestpPaidCampaignsParameters = {
        from: startDate,
        to: endDate
      }
      const response: HighestpPaidCampaigns = await this.adminService.getHighestPaidCampaigns(data);
      if (response.success) {
        this.utilityService.hideLoading();
        this.campaignsData = response.data;
        setTimeout(() => {
          var table = $('#highestPaidCampaignTable').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [5, 10, 15],
          });
          table.destroy();
        }, 1);

      } else {
        this.utilityService.hideLoading();
        throw new Error(response.message);
      }

    }
    catch (error) {
      this.utilityService.hideLoading();
    }

  }
}
