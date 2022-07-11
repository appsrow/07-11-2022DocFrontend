import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerOptions } from 'ng2-datepicker';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { MyCampaignDetails } from 'src/app/brand/models/myCampaign.model';
import { BudgetDetails, statisticsData, StatisticsResponseData, TargetDetails } from 'src/app/brand/models/statistics.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { PublicService } from '../../public.service';
import { default as _rollupMoment, Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { HeaderService } from 'src/app/shared/services/header.service';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

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
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class MetricsComponent {

  @ViewChild('content') metricsPasswordModal: NgbModal;
  public minDays: Number = 7;
  public maxDays: Number = 7;

  public date: Object = new Date();
  public dates: any;
  public start: Date = new Date('10/07/2017');
  public end: Date = new Date('11/25/2017');
  modalReference!: NgbModalRef;
  closeModal!: string;
  isPasswordCorrect: boolean = false;
  confirmPasswordForm: FormGroup;

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
  startDate: string;
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

  campaignLinkCode: string;
  campaignLinkCodeVerified: string;
  submittedPassword: boolean = false;
  statisticsFormData: FormGroup;
  startView: string = 'year';
  selectedYearData: any[] = [];
  selectedMonthData: any[] = [];

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
  chartTypeList: any = [];
  chartTypeSettings = {};
  selectYear: string = '';
  year: string = '';
  monthYearDate: string = '';
  switchLanguage: string = 'es';

  constructor(
    public publicService: PublicService,
    public utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    public translateService: TranslateService
  ) {
    if (this.activatedRoute.snapshot.params.campaign_sharing_code) {
      this.campaignLinkCode = this.activatedRoute.snapshot.params.campaign_sharing_code;
    }
    this.statisticsFormData = this.formBuilder.group({
      chartType: [[{ id: 3, itemName: 'Week' }], Validators.required],
      chosenYearDate: [''],
      monthInputCtrl: [''],
      year: ['']
    });
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
  }

  async ngOnInit() {
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
    await this.checkLink(this.campaignLinkCode);
  }

  setWeekDateToDatePicker() {
    const dateElement = $(this.elementRef.nativeElement).find('#statistics-date')[0] as HTMLElement;
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

  async getCampaignStatisticsDetail(startDate: string, endDate: string, selectedYear?: string, statistics_type?: string) {
    this.selectedWeekDates[0].dates = startDate;
    this.selectedWeekDates[6].dates = endDate;
    this.utilityService.showLoading();
    try {
      const data = {
        campaign_id: this.campaignId,
        from_date: startDate,
        to_date: endDate,
        statistics_type: statistics_type ? statistics_type : 'week',
      }

      const response: StatisticsResponseData = await this.publicService.getCampaignStatisticsData(data);

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

  async checkLink(link: string) {
    this.utilityService.showLoading();
    try {
      const data: any = {
        link: link
      };
      const response: any = await this.publicService.checkCampaignLink(data);
      if (response.success) {
        this.utilityService.hideLoading();
        this.campaignLinkCodeVerified = link;
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
        link: this.campaignLinkCodeVerified,
        password: this.confirmPasswordForm.value.password
      };

      const response: any = await this.publicService.checkCampaignLinkAndPassword(data);
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

  selectLanguage(language: string) {
    this.headerService.switchLanguage.next(language);
    localStorage.setItem('selectedLanguage', language);
  }

  // clickBar(barInfo: any, event: any) {
  //   console.log('barInfo', barInfo);
  //   console.log('barInfoevent', event);

  // }

}
