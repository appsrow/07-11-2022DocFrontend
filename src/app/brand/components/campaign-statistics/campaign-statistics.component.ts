import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DatepickerOptions } from 'ng2-datepicker';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandService } from '../../services/brand.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as _moment from 'moment';
import * as moment from 'moment';
//import moment from 'moment';
import { formatDate } from "@angular/common";
import { FlatpickrOptions } from 'ng2-flatpickr';
import { BudgetDetails, statisticsData, StatisticsResponseData, TargetDetails } from '../../models/statistics.model';
import { MyCampaignDetails } from '../../models/myCampaign.model';
import { Location } from '@angular/common';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from 'src/environments/environment.prod';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { GenderList } from 'src/app/user/models/registration.model';



export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-campaign-statistics',
  templateUrl: './campaign-statistics.component.html',
  styleUrls: ['./campaign-statistics.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})



export class CampaignStatisticsComponent implements OnInit {


  year: string = '';
  monthYearDate: string = '';
  selectYear: string = '';

  public minDays: Number = 7;
  public maxDays: Number = 7;
  public dates: any;
  public start: Date = new Date('10/07/2017');
  public end: Date = new Date('11/25/2017');
  modalReference!: NgbModalRef;
  closeModal!: string;
  @ViewChild('range')
  statisticsForm: FormGroup;
  campaignDetails: MyCampaignDetails;
  budgetDetails: BudgetDetails;
  statistics: statisticsData[];
  targetDetails: TargetDetails;
  campaignId: number;
  saleDataMulti: any = [];
  totalTarget: any = [];
  totalBudget: any = [];
  // startDate: string;
  endDate: string;
  budgetSpentInPercentage: number = 0;
  startingDate: string;
  selected: { start: '', end: '' };
  view: any = [innerWidth / 1.3, 500];
  schemeType: any = 'ordinal';
  colorScheme = {
    domain: ['#74FAAA', '#6577AD', '#ffff']
  };
  gradient: boolean = false;
  weekselect: DatepickerOptions = {};
  selectedRange: string = '';
  selectedWeekDates: any[] = [];
  selectedYearData: any[] = [];
  selectedMonthData: any[] = [];
  flatPickerOptions: FlatpickrOptions;
  weekPickerOptions: FlatpickrOptions = {
    defaultDate: moment().format('YYYY-MM-DD'),
    weekNumbers: true,
    wrap: false,
    onChange: (date: any) => {
      this.getSelectedWeekDates(moment(date[0]).format('YYYY-MM-DD'));
      this.getCampaignStatisticsDetail(this.selectedWeekDates[0].dates, this.selectedWeekDates[6].dates, '', 'week');
      this.setWeekDateToDatePicker();
    }, onReady: (date1: any) => {
      this.setWeekDateToDatePicker();
    }
  };

  // date = new FormControl(moment());
  campaignType: string = '';
  metricsLinkForm: FormGroup;
  submitted: boolean = false;
  isLinkAlreadyGenerated: boolean = false;
  linkId: string;
  credentialsString: string;
  startDate = new Date(2022, 0, 1);
  readonly moment = _rollupMoment || _moment;
  chosenYearDate: Date;
  chartTypeList: GenderList[] = [];
  chartTypeSettings = {};
  statisticsFormData: FormGroup;
  startView: string = 'year';
  events: string[] = [];
  monthInputCtrl: FormControl = new FormControl(new Date(2022, 0, 1));
  visible = true;
  showDatePickerType: string = 'week';
  getMonthNames = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  getWeekNames = [
    '',
    'Week1',
    'Week2',
    'Week3',
    'Week4',
  ];
  chartType = [{ id: 3, itemName: 'Week' }];


  constructor(
    public utilityService: UtilityService,
    private brandService: BrandService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private elementRef: ElementRef,
    private _location: Location,
    private modalService: NgbModal,
    private clipboard: Clipboard
  ) {
    this.selected = {
      start: '',
      end: ''
    }
    this.statisticsForm = this.formBuilder.group({
      datePicker: ['', Validators.required],
    });

    this.metricsLinkForm = this.formBuilder.group({
      link: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.statisticsFormData = this.formBuilder.group({
      chartType: [[{ id: 3, itemName: 'Week' }], Validators.required],
      chosenYearDate: [''],
      monthInputCtrl: [''],
      year: ['']
      // password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.chartTypeList = [
      { "id": 1, "itemName": "Year" },
      { "id": 2, "itemName": "Month" },
      { "id": 3, "itemName": "Week" }
    ];
    this.chartTypeSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass custom-class"
    };
    // this.flatPickerOptions.mode = 'moh'
    this.getSelectedWeekDates(moment().format('YYYY-MM-DD'));
    this.getCampaignStatisticsDetail(this.selectedWeekDates[0].dates, this.selectedWeekDates[6].dates, '', 'week');
  }

  setWeekDateToDatePicker() {
    const dateElement = $(this.elementRef.nativeElement).find('#statistics-date')[0] as HTMLElement;
    const dateInputElement = dateElement.childNodes[0].childNodes[0] as HTMLInputElement;
    if (this.selectedWeekDates) {
      dateInputElement.setAttribute('value', formatDate(moment(this.selectedWeekDates[0].dates).format('L'), 'dd-MM-yyyy', 'en-US') + ' to ' + formatDate(moment(this.selectedWeekDates[6].dates).format('L'), 'dd-MM-yyyy', 'en-US'));
    }

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

  getSelectedYearData() {
    this.selectedYearData = [];
    for (let i = 1; i <= 12; i++) {
      for (let j = 0; j < this.getMonthNames.length; j++) {
        if (i === j) {
          this.selectedYearData.push({
            monthNumber: i,
            months: this.getMonthNames[i],
            is_clicked: '0',
            is_completed: '0'
          });
        }
      }
    }
  }

  getSelectedMonthData() {
    this.selectedMonthData = [];
    for (let i = 1; i <= 4; i++) {
      for (let j = 0; j < this.getWeekNames.length; j++) {
        if (i === j) {
          this.selectedMonthData.push({
            weekNumber: i,
            weeks: this.getWeekNames[i],
            is_clicked: '0',
            is_completed: '0'
          });
        }
      }
    }
  }


  async getCampaignStatisticsDetail(startDate: string, endDate: string, selectedYear?: string, statistics_type?: string) {
    this.selectedWeekDates[0].dates = startDate;
    this.selectedWeekDates[6].dates = endDate;
    await this.route.queryParams.subscribe(
      params => {
        this.campaignId = params.campaignId;
      }
    )
    this.utilityService.showLoading();
    try {
      const data = {
        campaign_id: this.campaignId,
        from_date: startDate,
        to_date: endDate,
        statistics_type: statistics_type ? statistics_type : 'week',
      }

      const response: StatisticsResponseData = await this.brandService.getCampaignStatisticsData(data);

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

        if (statistics_type === 'week') {
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
        }

        if (statistics_type === 'year') {
          for (let i = 0; i < this.selectedYearData.length; i++) {
            for (let j = 0; j < this.statistics.length; j++) {
              if (this.selectedYearData[i].monthNumber === this.statistics[j].months) {
                this.selectedYearData[i].is_clicked = this.statistics[j].is_clicked;
                this.selectedYearData[i].is_completed = this.statistics[j].is_completed;
              }
            }
          }

          this.saleDataMulti = [];
          this.selectedYearData.forEach((statiscticsData: any) => {
            this.saleDataMulti.push({
              "name": statiscticsData.months,
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

          // this.startingDate = startDate;
          // if (this.saleDataMulti.length < 12) {
          //   for (var i = this.saleDataMulti.length; i <= 11; i++) {
          //     var startDateGraph = formatDate(moment(this.startingDate).add(1, 'days').format('L'), 'yyyy-MM-dd', 'en-US')
          //     this.saleDataMulti.push({
          //       "name": startDateGraph,
          //       "series": [
          //         {
          //           "name": "completed task",
          //           "value": 0
          //         }
          //       ]
          //     });
          //     this.startingDate = formatDate(moment(this.startingDate).add(1, 'days').format('L'), 'yyyy-MM-dd', 'en-US');
          //   }
          // }

        }

        if (statistics_type === 'month') {
          for (let i = 0; i < this.selectedMonthData.length; i++) {
            for (let j = 0; j < this.statistics.length; j++) {
              if (this.selectedMonthData[i].weeks === this.statistics[j].month_week) {
                this.selectedMonthData[i].is_clicked = this.statistics[j].is_clicked;
                this.selectedMonthData[i].is_completed = this.statistics[j].is_completed;
              }
            }
          }

          this.saleDataMulti = [];
          this.selectedMonthData.forEach((statiscticsData: any) => {
            this.saleDataMulti.push({
              "name": statiscticsData.weeks,
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
            "name": "Total spend",
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

  backToMyCampaign() {
    if (this.route.snapshot.queryParams['campaignType']) {
      this.campaignType = this.route.snapshot.queryParams['campaignType'];
      if (this.campaignType) {
        this.router.navigate(['brand/myCampaign'], { queryParams: { campaignTab: this.campaignType } });
      } else {
        this.router.navigate(['brand/myCampaign']);
      }
    }
    else {
      this._location.back();
    }
  }

  async triggerModal(content: any) {
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });

    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
    await this.getDefaultIdPassword();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  async getDefaultIdPassword() {
    try {
      this.utilityService.showLoading();
      const requestBody: any = {
        'campaign_id': this.campaignId,
      }
      const response: any = await this.brandService.getMetricsLinkData(requestBody);

      if (response) {
        this.isLinkAlreadyGenerated = response.data.is_link_already_generated;
        this.utilityService.hideLoading();
        this.metricsLinkForm.controls.link.setValue(environment.domain + 'campaign/' + response.data.link);
        this.metricsLinkForm.controls.password.setValue(response.data.password);
        var linkId = this.metricsLinkForm.value.link;
        var res = linkId.split("/");
        this.linkId = res[4];
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async insertMetricsData() {
    this.submitted = true;
    try {
      this.utilityService.showLoading();
      const requestBody: any = {
        'campaign_id': this.campaignId,
        'link': this.linkId,
        'password': this.metricsLinkForm.value.password,
      }
      const response: any = await this.brandService.insertMetricsLinkData(requestBody);

      if (response) {
        this.utilityService.hideLoading();
        this.utilityService.showSuccessToast('Link generated successfully');
        this.modalReference.close();
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  copyCredentials() {
    this.credentialsString = 'Please open the following link ' + "'" + this.metricsLinkForm.value.link + "'" + ' and enter the password ' + "'" + this.metricsLinkForm.value.password + "'" + ' to access the campaign metrics.'
    this.clipboard.copy(this.credentialsString);
  }



  async onChangeType(event: any) {
    if (event.id === 1) {
      this.startView = 'multi-year';
      this.showDatePickerType = 'year';

      const currentDate = new Date();
      const currentYear = moment(currentDate).format("YYYY");
      this.year = currentYear;
      let startDateOfYear = new Date(Number(this.year), 0, 1);
      let endDateOfYear = new Date(Number(this.year), 11, 31);
      this.selectedWeekDates[0].dates = formatDate(startDateOfYear, 'yyyy-MM-dd', "en-us");
      this.selectedWeekDates[6].dates = formatDate(endDateOfYear, 'yyyy-MM-dd', "en-us");
      this.getSelectedYearData();
      await this.getCampaignStatisticsDetail(formatDate(startDateOfYear, 'yyyy-MM-dd', "en-us"), formatDate(endDateOfYear, 'yyyy-MM-dd', "en-us"), this.year, 'year');
    }
    if (event.id === 2) {
      this.startView = 'year';
      this.showDatePickerType = 'month';
      const currentDate = new Date();
      const currentMonthYear = moment(currentDate).format("YYYY-MM");
      this.monthYearDate = currentMonthYear;
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
      const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');
      this.getSelectedMonthData();
      this.getCampaignStatisticsDetail(formatDate(startOfMonth, 'yyyy-MM-dd', "en-us"), formatDate(endOfMonth, 'yyyy-MM-dd', "en-us"), this.selectYear, 'month');
    }
    if (event.id === 3) {
      this.startView = 'month';
      this.showDatePickerType = 'week';
      this.getSelectedWeekDates(moment().format('YYYY-MM-DD'));
      this.getCampaignStatisticsDetail(this.selectedWeekDates[0].dates, this.selectedWeekDates[6].dates, '', 'week');
    }
  }

  chosenYear(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    const endDate = moment(normalizedYear).format('YYYY');
    this.year = endDate;
    let startDateOfYear = new Date(Number(this.year), 0, 1);
    let endDateOfYear = new Date(Number(this.year), 11, 31);
    this.getSelectedYearData();
    this.getCampaignStatisticsDetail(formatDate(startDateOfYear, 'yyyy-MM-dd', "en-us"), formatDate(endDateOfYear, 'yyyy-MM-dd', "en-us"), this.year, 'year');
    datepicker.close();
  }


  chosenYearHandler(normalizedYear: Moment) {
    const endDate = moment(normalizedYear).format('YYYY');
    this.selectYear = endDate;
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const endDate = moment(normalizedMonth).format('MM');
    this.monthYearDate = this.selectYear + endDate;
    const YearMonth = this.selectYear + '-' + endDate;
    const startOfMonth = moment(YearMonth).startOf('month').format('YYYY-MM-DD hh:mm');
    const endOfMonth = moment(YearMonth).endOf('month').format('YYYY-MM-DD hh:mm');
    this.getSelectedMonthData();
    this.getCampaignStatisticsDetail(formatDate(startOfMonth, 'yyyy-MM-dd', "en-us"), formatDate(endOfMonth, 'yyyy-MM-dd', "en-us"), this.selectYear, 'month');
    datepicker.close();
  }

  // clickBar(barInfo: any, event: any) {
  //   debugger
  //   console.log('barInfo', barInfo);
  //   console.log('barInfoevent', event);
  //   console.log('thisyear', this.year);
  //   console.log('thisbar', event.target.ariaLabel);
  //  // var res = this.getWeekDaysByWeekNumber(2);

  // }


  // getWeekDaysByWeekNumber(weeknumber: number) {
  //   var dateformat = "YYYY/MM/DD";
  //   var date = moment().isoWeek(weeknumber || 1).startOf("week"), weeklength = 7, result = [];
  //   while (weeklength--) {
  //     result.push(date.format(dateformat));
  //     date.add(1, "day")
  //   }
  //   return result;
  // }
}
