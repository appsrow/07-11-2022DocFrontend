import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatepickerOptions } from 'ng2-datepicker';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { InternalDashboardKpiRequestData, InternalDashboardKpiResponse } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import * as moment from 'moment';

@Component({
  selector: 'app-internal-dashboard',
  templateUrl: './internal-dashboard.component.html',
  styleUrls: ['./internal-dashboard.component.scss']
})
export class InternalDashboardComponent implements OnInit {

  createCampaignForm: FormGroup = new FormGroup({
    startDate: new FormControl(['']),
    endDate: new FormControl(['']),
  });
  submitted: boolean = false;
  startDate: DatepickerOptions = {
    format: 'dd-MM-yyyy'
  };
  endDate: DatepickerOptions = {
    format: 'dd-MM-yyyy'
  };
  serverDateFormate:any;
  dashboardKpi: any;
  startDateSelected: any;
  endDateSelected: any;

  constructor(public utilityService: UtilityService,
    private adminService: AdminService,
    private formBuilder: FormBuilder) {
  }

  async ngOnInit(){
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
    const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD');
    this.createCampaignForm.patchValue({ 
      startDate: new Date(startOfMonth),
      endDate: new Date(endOfMonth),
    });

    await this.getDashboardKpis();
    setTimeout(() => {
      this.startDate = {
        format: 'dd-MM-yyyy',
        placeholder: '',
       minDate:  new Date(this.serverDateFormate)
      };
      this.endDate = {
        format: 'dd-MM-yyyy',
        placeholder: '',
       minDate:  new Date(this.serverDateFormate)
      };
      this.createCampaignForm.controls.startDate.valueChanges.subscribe(async(x) => {     
        this.endDate.minDate = x;
        this.endDate = {
          format: 'dd-MM-yyyy',
          placeholder: '',
          minDate: x
        };
        let startDate = moment(x).format('Y-MM-DD');
        this.startDateSelected = startDate;
        await this.getDashboardKpis();
      });
      this.createCampaignForm.controls.endDate.valueChanges.subscribe(async(x) => {
        this.startDate = {
          format: 'dd-MM-yyyy',
          placeholder: '',
          minDate:  new Date(this.serverDateFormate),
          maxDate: x
        };
        let endDate = moment(x).format('Y-MM-DD');
        this.endDateSelected = endDate;
        await this.getDashboardKpis();
      });
    }, 2000);  
  }

  async getDashboardKpis(){
    try {
      this.utilityService.showLoading();
      const requestData: InternalDashboardKpiRequestData = {
        'start_date' : this.startDateSelected ? this.startDateSelected+' 00:00:00' : '',
        'end_date': this.endDateSelected ? this.endDateSelected+' 23:59:59' : ''
      }
      const res: InternalDashboardKpiResponse = await this.adminService.getDashboardKpis(requestData);
      if (res.success) {
        this.dashboardKpi = res.data;
        this.utilityService.hideLoading();
      }
      else {
        this.utilityService.hideLoading();
        throw new Error(res.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }
}
