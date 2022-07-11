import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { Brand, BrandDetailsInformation,BrandDetailsData, CampaignListDetail, ReportList, ReportListDetails, ReportDataParameters,ReportArrayCampaignType, ReportArrayCampaign, ReportArrayBrand, ReportArrayStatus } from '../../models/admin.model';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  arraycampaignType: ReportArrayCampaignType[] = [];
  arrayBrand: ReportArrayBrand[] = [];
  arraycampaign: ReportArrayCampaign[] = [];
  arraystatus: ReportArrayStatus[] = [];
  dropdownSettings = {};
  reportData: ReportListDetails[] = [];
  stringBrand: number[] = [];
  stringCampaignType: number[] = [];
  stringCampaign: number[] = [];
  stringStatus: number[] = [];
  brandData: BrandDetailsInformation[] = [];
  campaignData:  CampaignListDetail[];
  showCampaignList: boolean = true;
  fromDate!: string;
  toDate!: string;
  fileName: any; 
  date = new Date();
  firstDay = (new Date(this.date.getFullYear(), this.date.getMonth(), 1));
  lastDay = (new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0));
  weekPickerOptions: any = {
    mode: "range",
    dateFormat: 'd-m-Y',
    defaultDate: [this.firstDay, this.lastDay],
    onChange: (date: any) => {
      this.fromDate = moment(date[0]).format('DD-MM-YYYY');
      this.toDate = moment(date[1]).format('DD-MM-YYYY');
    },
    onReady: (date: any) => {
      this.fromDate = moment(date[0]).format('DD-MM-YYYY');
      this.toDate = moment(date[1]).format('DD-MM-YYYY');
    }
  };
  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    public utilityService: UtilityService,
  ) {
    this.reportForm = this.formBuilder.group({
      brand: [[]],
      campaigntype: [[]],
      campaignname: [[]],
      status: [[]]
    });
  }

  ngOnInit(): void {
    this.getBrandList();
    this.getReportData();
    this.arraycampaignType = [
      { "id": 1, "type": "lead_target", "itemName": "Lead" },
      { "id": 2, "type": "video_plays", "itemName": "Video" },
      { "id": 3, "type": "follow", "itemName": "Follow" },
      { "id": 4, "type": "apps_download", "itemName": "Apps Download" },
      { "id": 5, "type": "click_websites", "itemName": "Visit" },
    ];
    this.arraystatus = [
      { "id": 1, "itemName": "Programmed" },
      { "id": 2, "itemName": "Inprogress" },
      { "id": 3, "itemName": "closed" },
    ];
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
  }
  onChangeCampaignType() {
    const selectedCampaignTypes = this.reportForm.controls.campaigntype.value;
    if (selectedCampaignTypes.length > 0) {
      this.stringCampaignType = selectedCampaignTypes.map((data: any) => data.type);
    } else if (selectedCampaignTypes.length === 0) {
      this.stringCampaignType = [];
    }
  }
  async onChangeBrand() {
    const selectedBrands = this.reportForm.controls.brand.value;
    this.arraycampaign = [];
    if (selectedBrands.length > 0) {
      this.utilityService.showLoading();
      this.showCampaignList = false;
      let apiCount = 0;
      this.reportForm.patchValue({ campaignname: [] });
      this.stringCampaign = [];
      for (const brandData of selectedBrands) {
        const response: BrandDetailsData = await this.adminService.editBrands(brandData.id);
        apiCount = apiCount + 1;
        if (response.success) {
          this.campaignData = response.data.campaign_details;
          var companyName = response.data.company_info.company_name;
          for (const campaign of this.campaignData) {
            if (campaign.is_approved === 'APPROVED') {
              this.arraycampaign.push({
                itemName: campaign.campaign_name + ' ' + '(' + companyName + ')',
                id: campaign.id
              });
            }
          }
          if (apiCount === selectedBrands.length) {
            this.showCampaignList = true;
            this.utilityService.hideLoading();
          }
        }
      }
      this.stringBrand = selectedBrands.map((data: any) => data.id);
    } else if (selectedBrands.length === 0) {
      this.stringCampaign = [];
      this.stringBrand = [];
      this.reportForm.patchValue({ campaignname: [] });
    }
  }
  onChangeCampaign() {
    const selectedCampaigns = this.reportForm.controls.campaignname.value;
    if (selectedCampaigns.length > 0) {
      this.stringCampaign = selectedCampaigns.map((data: any) => data.id);
    } else if (selectedCampaigns.length === 0) {
      this.stringCampaign = [];
    }
  }
  onChangeStatus() {
    const selectedStatus = this.reportForm.controls.status.value;
    if (selectedStatus.length > 0) {
      this.stringStatus = selectedStatus.map((data: any) => data.id);
    } else if (selectedStatus.length === 0) {
      this.stringStatus = [];
    }
  }
  async getBrandList() {
    const res: Brand = await this.adminService.getAllBrands();
    if (res.success = true) {
      this.brandData = res.data;
      for (var i = 0; i < this.brandData.length; i++) {
        if (this.brandData[i].active === 1 && this.brandData[i].confirmed === 1) {
          this.arrayBrand.push({
            itemName: this.brandData[i]?.company_info[0].company_name,
            id: this.brandData[i].id
          });
        }
      }
    }
    else {
      throw new Error(res.message);
    }
  }
  async getReportData() {
    this.utilityService.showLoading();
    try {
      var data:ReportDataParameters = {
        from: this.fromDate ? this.fromDate : "",
        to: this.toDate ? this.toDate : "",
        brand: this.stringBrand.toString(),
        type: this.stringCampaignType.toString(),
        campaign: this.stringCampaign.toString(),
        status: this.stringStatus.toString()
      }
      const response:ReportList = await this.adminService.getReportData(data)
        if (response.success) {
          this.utilityService.hideLoading();
          this.reportData = response.data.records;
          var datatable = $('#reportTable').DataTable();
          datatable.destroy();
          setTimeout(() => {
            $('#reportTable').DataTable({
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              lengthMenu: [5, 10, 15],
              destroy: true,
            });
          }, 1);

        } 
        else {
          this.utilityService.hideLoading();
        }
     
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }
  async exportToExcel() {
    var datatable = $('#reportTable').DataTable();
    datatable.destroy();
    $('#reportTable').DataTable({
        "paging":   false,
    });
     let element = document.getElementById('reportTable'); 
     
     const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
     const wb: XLSX.WorkBook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
     let dateObj = new Date();
     let todayDate = (dateObj.getUTCFullYear()) + "/" + (dateObj.getMonth() + 1)+ "/" + (dateObj.getUTCDate());
     this.fileName = "CampaignReport_" + todayDate + ".xlsx";
     XLSX.writeFile(wb, this.fileName);
      $('#reportTable').DataTable({
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              lengthMenu: [5, 10, 15],
              destroy: true,
      });

  }
}
