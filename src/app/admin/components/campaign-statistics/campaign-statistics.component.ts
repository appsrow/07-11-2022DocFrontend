import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatepickerOptions } from 'ng2-datepicker';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { formatDate } from "@angular/common";
import { FlatpickrOptions } from 'ng2-flatpickr';
import { Location } from '@angular/common';
import { CampaignStatisticsParameters, CampaignStatisticsDataList, CampaignListDetail, BudgetDetailsData, StasticsData, TargetData } from '../../models/admin.model';
@Component({
  selector: 'app-campaign-statistics',
  templateUrl: './campaign-statistics.component.html',
  styleUrls: ['./campaign-statistics.component.scss']
})
export class CampaignStatisticsComponent implements OnInit {
  public minDays: Number = 7;
  public maxDays: Number = 7;
  public date: Object = new Date();
  public dates: any;
  public start: Date = new Date('10/07/2017');
  public end: Date = new Date('11/25/2017');
  statisticsForm: FormGroup;
  campaignDetails: CampaignListDetail;
  budgetDetails: BudgetDetailsData;
  statistics: StasticsData[];
  targetDetails: TargetData;
  campaignId: number = 0;
  saleDataMulti: any = [];
  totalTarget: any = [];
  totalBudget: any = [];
  startDate: string = '';
  endDate: string = '';
  budgetSpentInPercentage: number = 0;
  startingDate: string = '';
  dateValue: any;
  selected: { start: '', end: '' };
  view: any = [innerWidth / 1.3, 500];
  pieView: any = [700, 400];
  schemeType: any = 'ordinal';
  minDate = moment().subtract(1, "days");
  maxDate = moment().toDate();
  colorScheme = {
    domain: ['#3f8cff', '#69728d', '#ffff']
  };
  gradient: boolean = false;
  weekselect: DatepickerOptions = {};
  selectedRange: string = '';
  selectedWeekDates: any[] = [];
  weekPickerOptions: FlatpickrOptions = {
    defaultDate: moment().format('YYYY-MM-DD'),
    weekNumbers: true,
    wrap: false,
    onChange: (date: any) => {
      this.getSelectedWeekDates(moment(date[0]).format('YYYY-MM-DD'));
      this.getCampaignStatisticsDetail(this.selectedWeekDates[0].dates, this.selectedWeekDates[6].dates);
      this.setWeekDateToDatePicker();
    }, onReady: (date1: any) => {
      this.setWeekDateToDatePicker();
    }
  };

  constructor(
    public utilityService: UtilityService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _location: Location,
    private elementRef: ElementRef
  ) {
    this.selected = {
      start: '',
      end: ''
    }
    this.statisticsForm = this.formBuilder.group({
      datePicker: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.getSelectedWeekDates(moment().format('YYYY-MM-DD'));
    this.getCampaignStatisticsDetail(this.selectedWeekDates[0].dates, this.selectedWeekDates[6].dates);
  }

  setWeekDateToDatePicker() {
    const dateElement = $(this.elementRef.nativeElement).find('#statistics-admin-date')[0] as HTMLElement;
    const dateInputElement = dateElement.childNodes[0].childNodes[0] as HTMLInputElement;
    dateInputElement.setAttribute('value', formatDate(moment(this.selectedWeekDates[0].dates).format('L'), 'dd-MM-yyyy', 'en-US') + ' to ' + formatDate(moment(this.selectedWeekDates[6].dates).format('L'), 'dd-MM-yyyy', 'en-US'));
  }

  getSelectedWeekDates(selectedDate: string) {
    this.selectedWeekDates = [];
    var weekStart = moment(selectedDate).clone().startOf('isoWeek');
    for (let i = 0; i <= 6; i++) {
      this.selectedWeekDates.push({
        dates: moment(weekStart).add(i, 'days').format('YYYY-MM-DD'),
        is_clicked: '0',
        is_completed: '0'
      });
    }
  }

  async getCampaignStatisticsDetail(startDate: string, endDate: string) {
    await this.route.queryParams.subscribe(params => {
      this.campaignId = params.campaignId;
    }
    )
    this.utilityService.showLoading();
    try {
      const data: CampaignStatisticsParameters = {
        campaign_id: this.campaignId,
        from_date: startDate,
        to_date: endDate
      }

      const response: CampaignStatisticsDataList = await this.adminService.getCampaignStatisticsData(data);
      
      if (response.success) {
        this.campaignDetails = response.data.campaign_details;
        this.statistics = response.data.stastics;
        this.targetDetails = response.data.target_details;
        this.budgetDetails = response.data.budget_details;
        this.budgetDetails.total_budget = Math.ceil(this.budgetDetails.total_budget * 100) / 100;
        this.budgetDetails.total_left = Math.ceil(this.budgetDetails.total_left * 100) / 100;
        this.budgetDetails.total_spend = Math.ceil(this.budgetDetails.total_spend * 100) / 100;
        this.targetDetails.target_percentage = Math.ceil(this.targetDetails.target_percentage * 100) / 100;
        this.budgetSpentInPercentage = (this.budgetDetails.total_spend * 100) / this.budgetDetails.total_budget;
        for (let i = 0; i < this.selectedWeekDates.length; i++) {
          for (let j = 0; j < this.statistics.length; j++) {
            if (this.selectedWeekDates[i].dates === this.statistics[j].dates) {
              this.selectedWeekDates[i].is_clicked = this.statistics[j].is_clicked;
              this.selectedWeekDates[i].is_completed = this.statistics[j].is_completed;
            }
          }
        }
        this.saleDataMulti = [];
        this.selectedWeekDates.forEach((statiscticsData: any) => {
          this.saleDataMulti.push({
            "name": formatDate(moment(statiscticsData.dates).format('L'), 'dd-MM-yyyy', 'en-US'),
            "series": [
              {
                "name": "Completed task",
                "value": statiscticsData.is_completed
              },
              {
                "name": "Number of clicks",
                "value": statiscticsData.is_clicked
              },
            ],

          });

        });

        this.startingDate = startDate;
        if (this.saleDataMulti.length < 7) {
          for (var i = this.saleDataMulti.length; i <= 6; i++) {
            var startDateGraph = formatDate(moment(this.startingDate).add(1, 'days').format('L'), 'yyyy-MM-dd', 'en-US')
            this.saleDataMulti.push({
              "name": startDateGraph,
              "series": [
                {
                  "name": "completed task",
                  "value": 0
                }
              ]
            });
            this.startingDate = formatDate(moment(this.startingDate).add(1, 'days').format('L'), 'yyyy-MM-dd', 'en-US');
          }
        }

        this.totalTarget = [
          {
            "name": "Total achieved",
            "value": this.targetDetails.total_archived,
          },
          {
            "name": "Total left",
            "value": this.targetDetails.total_target - this.targetDetails.total_archived,
          }
        ];
        this.totalBudget = [
          {
            "name": "Total left",
            "value": this.budgetDetails.total_spend,
          },
          {
            "name": "Total sepend",
            "value": this.budgetDetails.total_left
          }
        ];

        this.utilityService.hideLoading();
      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.saleDataMulti = [];
      this.totalBudget = [];
      this.totalTarget = [];
      this.utilityService.hideLoading();
    }
  }

  backToCampaign() {
    this._location.back();
  }
}
