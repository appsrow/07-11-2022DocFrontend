import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/shared/services/header.service';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../metrics/metrics.component';
import { PublicService } from '../../public.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { BudgetDetails, statisticsData, StatisticsResponseData, TargetDetails } from 'src/app/brand/models/statistics.model';
import { MyCampaignDetails } from 'src/app/brand/models/myCampaign.model';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';

@Component({
  selector: 'app-ambassadors-dashboard',
  templateUrl: './ambassadors-dashboard.component.html',
  styleUrls: ['./ambassadors-dashboard.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AmbassadorsDashboardComponent implements OnInit {

  @ViewChild('content') metricsPasswordModal: NgbModal;
  switchLanguage: string = 'es';
  chartTypeList: any = [];
  showDatePickerType: string = 'week';
  chartTypeSettings = {};
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
  startView: string = 'year';
  year: string = '';
  selectedYearData: any[] = [];
  monthYearDate: string = '';
  selectedMonthData: any[] = [];
  selectedWeekDates: any[] = [];
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
  selectYear: string = '';
  campaignId: number;
  campaignDetails: MyCampaignDetails;
  statistics: any[];
  targetDetails: TargetDetails;
  budgetDetails: BudgetDetails;
  budgetSpentInPercentage: number = 0;
  saleDataMulti: any = [];
  startingDate: string;
  totalTarget: any = [];
  totalBudget: any = [];
  getWeekNames = [
    '',
    'Week1',
    'Week2',
    'Week3',
    'Week4',
    'Week5'
  ];
  isPasswordCorrect: boolean = false;
  streamer_user_name: string;
  modalReference!: NgbModalRef;
  closeModal!: string;
  confirmPasswordForm: FormGroup;
  view: any = [innerWidth / 1.3, 500];
  colorScheme = {
    domain: ['#74FAAA', '#6577AD', '#d99857']
  };
  schemeType: any = 'ordinal';
  chartType = [{ id: 3, itemName: 'Week' }];
  statisticsFormData: FormGroup;
  saleData: any = [];
  saleDataApiResponse: any = [];
  pieChartData: any = [];
  percentageData: any = {};
  streamerName: string = '';
  submittedPassword: boolean = false;

  constructor(public publicService: PublicService,
    public utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    public translateService: TranslateService) {
    this.headerService.switchLanguage.subscribe(res => {
      this.switchLanguage = res;
      translateService.setDefaultLang(res);
      translateService.use(res);
    });
    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.switchLanguage = res;
      } else {
        this.switchLanguage = '';
      }
    })
    if (this.activatedRoute.snapshot.params.streamer_user_name) {
      this.streamer_user_name = this.activatedRoute.snapshot.params.streamer_user_name;
      console.log('streamer_user_name', this.streamer_user_name);
      this.checkReferralStreamer(this.streamer_user_name);
    }
    this.statisticsFormData = this.formBuilder.group({
      chartType: [[{ id: 3, itemName: 'Week' }], Validators.required],
      chosenYearDate: [''],
      monthInputCtrl: [''],
      year: ['']
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
    this.getSelectedWeekDates(moment().format('YYYY-MM-DD'));
  }


  selectLanguage(language: string) {
    this.headerService.switchLanguage.next(language);
    localStorage.setItem('selectedLanguage', language);
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

  getSelectedYearData() {
    this.selectedYearData = [];
    for (let i = 1; i <= 12; i++) {
      for (let j = 0; j < this.getMonthNames.length; j++) {
        if (i === j) {
          this.selectedYearData.push({
            monthNumber: i,
            months: this.getMonthNames[i],
            own_subs: 0,
            other_subs: 0,
            other_rewards: 0
          });
        }
      }
    }
  }

  async getCampaignStatisticsDetail(startDate: string, endDate: string, selectedYear?: string, statistics_type?: string) {
    this.selectedWeekDates[0].dates = startDate;
    this.selectedWeekDates[6].dates = endDate;
    this.utilityService.showLoading();
    try {
      const data = {
        streamer_name: this.streamerName,
        from_date: startDate,
        to_date: endDate,
        statistics_type: statistics_type ? statistics_type : 'week',
      }
      this.statistics = [];
      const response: any = await this.publicService.getAmbassadorsStatisticsData(data);

      if (response.success) {
        this.statistics = response.data.statistics_data;
        this.saleData = response.data.overall_progress_data;
        this.percentageData = response.data.streamers_progress_in_percentage;
        if (statistics_type === 'week') {
          for (let i = 0; i < this.selectedWeekDates.length; i++) {
            for (let j = 0; j < this.statistics.length; j++) {
              if (this.selectedWeekDates[i].dates === this.statistics[j].dates) {
                this.selectedWeekDates[i].own_subs = this.statistics[j].own_subs;
                this.selectedWeekDates[i].other_subs = this.statistics[j].other_subs;
                this.selectedWeekDates[i].other_rewards = this.statistics[j].other_rewards;
              }
            }
          }

          this.saleDataMulti = [];
          this.selectedWeekDates.forEach((statiscticsData: any) => {
            this.saleDataMulti.push({
              "name": formatDate(moment(statiscticsData.dates).format('L'), 'dd-MM-yyyy', 'en-US'),
              "series": [
                {
                  "name": "Own subscriptions",
                  "value": statiscticsData.own_subs
                },
                {
                  "name": "Other subscriptions",
                  "value": statiscticsData.other_subs
                },
                {
                  "name": "Other rewards",
                  "value": statiscticsData.other_rewards
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
                    "name": "Own subscriptions",
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
              if (this.selectedYearData[i].monthNumber === this.statistics[j].month) {
                this.selectedYearData[i].own_subs = this.statistics[j].own_subs;
                this.selectedYearData[i].other_subs = this.statistics[j].other_subs;
                this.selectedYearData[i].other_rewards = this.statistics[j].other_rewards;
              }
            }
          }

          this.saleDataMulti = [];
          this.selectedYearData.forEach((statiscticsData: any) => {
            this.saleDataMulti.push({
              "name": statiscticsData.months,
              "series": [
                {
                  "name": "Own subscriptions",
                  "value": statiscticsData.own_subs
                },
                {
                  "name": "Other subscriptions",
                  "value": statiscticsData.other_subs
                },
                {
                  "name": "Other rewards",
                  "value": statiscticsData.other_rewards
                },
              ],

            });
          });
        }

        if (statistics_type === 'month') {
          for (let i = 0; i < this.selectedMonthData.length; i++) {
            for (let j = 0; j < this.statistics.length; j++) {
              if (this.selectedMonthData[i].weeks === this.statistics[j].month_week) {
                this.selectedMonthData[i].own_subs = this.statistics[j].own_subs;
                this.selectedMonthData[i].other_subs = this.statistics[j].other_subs;
                this.selectedMonthData[i].other_rewards = this.statistics[j].other_rewards;
              }
            }
          }
          this.saleDataMulti = [];
          this.selectedMonthData.forEach((statiscticsData: any) => {
            this.saleDataMulti.push({
              "name": statiscticsData.weeks,
              "series": [
                {
                  "name": "Own subscriptions",
                  "value": statiscticsData.own_subs
                },
                {
                  "name": "Other subscriptions",
                  "value": statiscticsData.other_subs
                },
                {
                  "name": "Other rewards",
                  "value": statiscticsData.other_rewards
                },
              ],

            });
          });
        }
        this.utilityService.hideLoading();
      } else {
        this.statistics = [];
        this.saleDataMulti = [];
        this.percentageData = [];
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.saleDataMulti = [];
      this.totalBudget = [];
      this.totalTarget = [];
      this.utilityService.hideLoading();
    }
  }

  getSelectedMonthData() {
    this.selectedMonthData = [];
    for (let i = 1; i <= 5; i++) {
      for (let j = 0; j < this.getWeekNames.length; j++) {
        if (i === j) {
          this.selectedMonthData.push({
            weekNumber: i,
            weeks: this.getWeekNames[i],
            own_subs: '0',
            other_subs: '0',
            other_rewards: '0'
          });
        }
      }
    }
  }

  getSelectedWeekDates(selectedDate: string) {
    this.selectedWeekDates = [];
    var weekStart = moment(selectedDate).clone().startOf('isoWeek');
    for (let i = 0; i <= 6; i++) {
      this.selectedWeekDates.push({
        dates: moment(weekStart).add(i, 'days').format('YYYY-MM-DD'),
        own_subs: '0',
        other_subs: '0',
        other_rewards: '0'
      });
    }
  }

  async checkReferralStreamer(streamerName: string) {
    this.utilityService.showLoading();
    try {
      const data: any = {
        streamer_name: streamerName
      };
      const response: any = await this.publicService.checkReferralLink(data);
      if (response.success) {
        this.streamerName = response.data.streamer_name;
        this.utilityService.hideLoading();
        this.openPasswordModal(this.metricsPasswordModal);
      } else {
        this.utilityService.hideLoading();
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  openPasswordModal(content: any) {
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
    this.confirmPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required]]
    });
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

  async checkLinkAndPassword() {
    this.submittedPassword = true;
    if (!this.confirmPasswordForm.valid) {
      return;
    }
    this.utilityService.showLoading();
    try {
      const data: any = {
        streamer_name: this.streamerName,
        password: this.confirmPasswordForm.value.password
      };

      const response: any = await this.publicService.checkAmbassadorLinkAndPassword(data);
      if (response.success) {
        this.utilityService.hideLoading();
        this.campaignId = response.data.campaign_id;
        this.modalReference.close();
        this.getSelectedWeekDates(moment().format('YYYY-MM-DD'));
        this.getCampaignStatisticsDetail(this.selectedWeekDates[0].dates, this.selectedWeekDates[6].dates, '', 'week');
        this.isPasswordCorrect = true;
      } else {
        this.utilityService.hideLoading();
        this.modalReference.close();
        this.utilityService.showErrorToast('The link or password is invalid');
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  setWeekDateToDatePicker() {
    const dateElement = $(this.elementRef.nativeElement).find('#statistics-date')[0] as HTMLElement;
    const dateInputElement = dateElement.childNodes[0].childNodes[0] as HTMLInputElement;
    dateInputElement.setAttribute('value', formatDate(moment(this.selectedWeekDates[0].dates).format('L'), 'dd-MM-yyyy', 'en-US') + ' to ' + formatDate(moment(this.selectedWeekDates[6].dates).format('L'), 'dd-MM-yyyy', 'en-US'));
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

  chosenYearHandler(normalizedYear: Moment) {
    const endDate = moment(normalizedYear).format('YYYY');
    this.selectYear = endDate;
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

}
