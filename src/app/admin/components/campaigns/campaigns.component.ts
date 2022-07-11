import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Country, CountryList, GenderList } from 'src/app/user/models/registration.model';
import { ApprovedOrRejectCampaignParameters, ApprovedOrRejectCampaignData, CampaignListObject, CampaignList, CampaignListDetail, } from '../../models/admin.model';
import { UserService } from 'src/app/user/services/user.service';
import * as moment from 'moment';
@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent implements OnInit {
  CampaignList: CampaignListDetail[] = [];
  campaignDetailData: CampaignListDetail;
  showCampaignApproved: boolean = true;
  approved: string = 'APPROVED';
  brandRejectForm: FormGroup;
  submitted: boolean = false;
  modalReference!: NgbModalRef;
  modalContent: any;
  closeModal!: string;
  countries: CountryList[] = [];
  countryNames: string = '';
  genderList: GenderList[] = [];
  genderNames: string = '';
  translate: any;

  /* 1. Some required variables which will be used by YT API*/
  public YT: any;
  public video: any;
  public player: any;
  public reframed: Boolean = false;
  myWindow: any = window;

  constructor(
    config: NgbModalConfig,
    private adminService: AdminService,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalPopupService: NgbModal,
    private userService: UserService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.brandRejectForm = this.formBuilder.group({
      note: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.getCampaignList();
    await this.getCountries();
    this.genderList = [
      { "id": 1, "itemName": "Male" },
      { "id": 2, "itemName": "Female" },
      { "id": 3, "itemName": "Other" }
    ];
  }
  goToCampaignStatistics(campaignId: number) {
    this.router.navigate(['admin/statistics'], { queryParams: { campaignId: campaignId } });
  }

  async getCampaignList() {
    this.utilityService.showLoading();
    try {
      const res: CampaignList = await this.adminService.getCampaignList();
      if (res.success) {
        this.utilityService.hideLoading();
        this.CampaignList = res.data;
        for (var i = 0; i < this.CampaignList.length; i++) {
          this.CampaignList[i].converted_created_at = moment(this.CampaignList[i].created_at).format('DD/MM/YYYY')
        }
        var table: any;
        setTimeout(() => {
          table = $('#campaignListTable').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [10, 20],
            destroy: true,
            order: [],
            "dom": "l<'#myFilter'>frtip"
          });
          var myFilter = '<select id="ddlCampaignStatus">'
            + '<option value="*">All</option>'
            + '<option value="APPROVED">Approved</option>'
            + '<option value="PENDING" selected>Pending</option>'
            + '<option value="REJECTED">Rejected</option>'
            + '</select>';
          $("#myFilter").html(myFilter);
          $.fn.dataTable.ext.search.push(
            function (settings: any, data: string[]) {
              var statusData = data[7] || "";
              var filterVal = $("#ddlCampaignStatus").val();
              if (settings.sTableId === 'campaignListTable' && filterVal != "*") {
                if (statusData == filterVal)
                  return true;
                else
                  return false;
              }
              else {
                return true;
              }
            });
          table.draw();

        });
        $.fn.dataTable.ext.search.pop();
        $("#mainContainer").on("change", "#ddlCampaignStatus", function () {
          table.draw();
        });
      } else {
        this.CampaignList = [];
        setTimeout(() => {
          table = $('#campaignListTable').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [10, 20],
            destroy: true,
            order: [],
          });
        });
      }
    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToFetchData');
      this.utilityService.hideLoading();
    }
  }

  async getCampaignDetailsById(campaignId: number) {
    this.utilityService.showLoading();
    try {

      const res: CampaignListObject = await this.adminService.getCampaignDetailsDataById(campaignId);
      if (res.success) {
        this.utilityService.hideLoading();
        this.campaignDetailData = res.data;
        this.countryNames = '';
        if (res.data.country) {
          var selectedCountryIds = res.data.country.split(',');

          for (let country of this.countries) {
            for (let counIdd of selectedCountryIds) {
              if (country.id === parseInt(counIdd)) {
                this.countryNames = this.countryNames + country.itemName + ',';
              }
            }
          }
          this.countryNames = this.countryNames.substring(0, this.countryNames.length - 1);
        }

        if (this.campaignDetailData.gender) {
          var genderResult = this.genderList.filter((genderListItem: any) => this.campaignDetailData.gender.includes(genderListItem.id));
          this.genderNames = Array.prototype.map.call(genderResult, function (item) { return item.itemName; }).join(",");
        }

        if (this.campaignDetailData.is_approved === 'PENDING') {
          this.showCampaignApproved = true;
        }
      } else {
        throw new Error(res.message);
      }

    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToUpdate');
      this.utilityService.hideLoading();
    }

  }

  toggleApproveReject(event: { checked: any; }) {
    this.approved = event.checked ? 'APPROVED' : 'REJECTED';
  }

  async approveOrRejectCampaign(campaignId: number, companyId: number) {
    this.submitted = true;
    if (this.approved === '' || (this.approved === 'REJECTED' && !this.brandRejectForm.value.note)) {
      return false;
    }

    try {
      this.utilityService.showLoading();
      const campaignData: ApprovedOrRejectCampaignParameters = {
        'company_id': companyId,
        'campaign_id': campaignId,
        'is_approved': this.approved,
        'note': this.approved === 'REJECTED' ? this.brandRejectForm.value.note : ''
      };

      const res: ApprovedOrRejectCampaignData = await this.adminService.approveOrRejectCampaign(campaignData);
      if (res.success) {
        this.utilityService.hideLoading();
        this.approved === 'REJECTED' ? this.utilityService.showSuccessToast('toast.campaignRejected') : this.utilityService.showSuccessToast('toast.campaignApproved');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        this.approved = 'APPROVED';
        this.brandRejectForm.controls.note.setValue('');
      } else {
        throw new Error(res.message);
      }

    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToUpdate');
      this.utilityService.hideLoading();
    }
  }
  async triggerVideoModal(content: any, task: any) {
    this.modalContent = task;
    this.modalReference = await this.modalPopupService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'lg' })

    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });

    // check if its youtube url extract youtube id from url
    if (this.campaignDetailData.video_id) {
      this.video = this.campaignDetailData.video_id;
      if (this.myWindow['YT']) {
        this.startVideo();
        return;
      }

      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag: any = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      /* 3. startVideo() will create an <iframe> (and YouTube player) after the API code downloads. */
      this.myWindow['onYouTubeIframeAPIReady'] = () => this.startVideo();

    }
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

  async getCountries() {
    this.utilityService.showLoading();
    try {
      const response: Country = await this.userService.getCountries();
      if (response.success) {
        this.countries = response.data;

        const newArray = this.countries.map((item: any) => {
          return { id: item.id, itemName: item.country_name };
        });
        this.countries = newArray;
      }
      this.utilityService.hideLoading();
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCountryList');
      this.utilityService.hideLoading();
    }
  }

  startVideo() {
    this.reframed = false;
    this.player = new this.myWindow['YT'].Player('player', {
      // height: '400',
      width: '100%',
      videoId: this.video,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        controls: 1,
        disablekb: 0,
        rel: 1,
        showinfo: 0,
        fs: 0,
        playsinline: 1,

      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });

  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event: any) {
    switch (event.data) {
      case this.myWindow['YT'].PlayerState.ENDED:
        this.modalReference.close();
        break;
    };
  }

}
