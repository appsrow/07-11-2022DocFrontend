import { Component, OnInit, resolveForwardRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';
import { ModalService } from '../../model.service';
import { Country, CountryList, GenderList } from 'src/app/user/models/registration.model';
import { UserService } from 'src/app/user/services/user.service';
import { CompanyInformation, PaymentDetailsList, PaymentDetailsListData, ChangeStatusData, ChangeStatusDataParameters, ApprovedOrRejectCampaignParameters, ApprovedOrRejectCampaignData, BrandDetailsData, BrandDetailsObject, CampaignListObject, CampaignListDetail, DownloadInvoice } from '../../models/admin.model';
import { HeaderService } from 'src/app/shared/services/header.service';
@Component({
  selector: 'app-brands-details',
  templateUrl: './brands-details.component.html',
  styleUrls: ['./brands-details.component.scss'],
})
export class BrandsDetailsComponent implements OnInit {
  brandData: BrandDetailsObject;
  campaignDatas: CampaignListDetail[];
  paymentdetailData: PaymentDetailsListData[];
  profilePicture: string = '';
  activeValue: number;
  isActiveChecked: boolean;
  showCampaignApproved: boolean;
  approved: string = 'APPROVED';
  companyInfo: CompanyInformation;
  campaignDetailData: CampaignListDetail;
  brandRejectForm: FormGroup;
  submitted: boolean = false;
  paymentDetail: boolean = false;
  confirmedResult: boolean;
  activeResult: string = '';
  modalReference: NgbModalRef;
  id: any;
  modalContent: any;
  closeModal: string;
  countries: CountryList[] = [];
  countryNames: string = '';
  genderList: GenderList[] = [];
  genderNames: string = '';
  areYouSureString: string = '';

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
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public modalService: ModalService,
    private modalPopupService: NgbModal,
    private userService: UserService,
    private headerService: HeaderService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.brandRejectForm = this.formBuilder.group({
      note: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    await this.getBrandData();
    await this.getPaymentdetail();
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

  checkBrandActiveInactive(event: { checked: any; }) {
    this.isActiveChecked = event.checked;
    if (event.checked == true) {
      this.activeResult = "active"
    }
    else {
      this.activeResult = "inactive"
    }

    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.areYouSureString = 'Estas segura quieres ';
      } else {
        this.areYouSureString = 'Are you sure, you want to ';
      }
    });

    this.modalService.confirm(this.areYouSureString + this.activeResult + '?').pipe(take(1)).subscribe((result: any) => {
      this.confirmedResult = result;
      if (this.confirmedResult == true) {
        this.changeUserStatus();
      }
      else {
        if (this.activeResult == "active") {
          this.isActiveChecked = false;
        }
        else {
          this.isActiveChecked = true;
        }
      }
    });
  }

  async getBrandData() {
    this.utilityService.showLoading();
    try {
      const res: BrandDetailsData = await this.adminService.editBrands(this.id);
      if (res.success) {
        this.utilityService.hideLoading();
        this.brandData = res.data;
        if (res.data.campaign_details) {
          this.campaignDatas = res.data.campaign_details;
        } else {
          this.campaignDatas = [];
        }
        this.companyInfo = res.data.company_info;
        var table: any;
        setTimeout(() => {
          table = $('#campaign_table_data').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [10, 20],
            destroy: true,
            "dom": "l<'#myFilter'>frtip"
          });
          var myFilter = '<select id="ddlSelect">'
            + '<option value="*">All</option>'
            + '<option value="APPROVED">Approved</option>'
            + '<option value="PENDING" selected>Pending</option>'
            + '<option value="REJECTED">Rejected</option>'
            + '</select>';
          $("#myFilter").html(myFilter);
          $.fn.dataTable.ext.search.push(
            function (settings: any, data: string[]) {
              var statusData = data[6] || "";
              var filterVal = $("#ddlSelect").val();
              if (settings.sTableId === 'campaign_table_data' && filterVal != "*") {
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
        $("#mainContainer").on("change", "#ddlSelect", function () {
          table.draw();
        });
        res.data.user_photo ? this.profilePicture = res.data.user_photo : '';
        if (res.data.active == 1) {
          this.isActiveChecked = true;
        } else {
          this.isActiveChecked = false;
        }
      }
      else {
        throw new Error(res.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedToFetchData');
      this.utilityService.hideLoading();
    }
  }


  async changeUserStatus() {
    if (this.isActiveChecked == true) {
      this.activeValue = 1;
    } else {
      this.activeValue = 0;
    }
    const brandStatusData: ChangeStatusDataParameters = {
      user_id: this.id,
      active: this.activeValue
    };
    this.utilityService.showLoading();
    try {
      const res: ChangeStatusData = await this.adminService.changeUserStatus(brandStatusData)
      if (res.success) {
        this.utilityService.hideLoading();
        this.utilityService.showSuccessToast('toast.brandActivationStatusChanged');
        this.router.navigate(['/admin/brands']);
      } else {
        throw new Error(res.message);
      }

    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToUpdate');
      this.utilityService.hideLoading();
    }
  }
  async getPaymentdetail() {
    this.utilityService.showLoading();
    try {

      const res: PaymentDetailsList = await this.adminService.getPaymentdetail(this.id);
      if (res.success) {
        this.paymentDetail = true;
        this.utilityService.hideLoading();
        this.paymentdetailData = res.data;
        setTimeout(() => {
          $('#paymentdetail_table').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [10, 20],
            destroy: true,
          });
        });
      } else {
        this.utilityService.hideLoading();
        this.paymentDetail = false;
        this.paymentdetailData = [];
        setTimeout(() => {
          $('#paymentdetail_table').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [10, 20],
            destroy: true,
          });
        });
      }

    }
    catch (error) {
      this.utilityService.hideLoading();
    }

  }
  async downloadInvoice(id: number, invoice_id: number) {
    this.utilityService.showLoading();

    const response: DownloadInvoice = await this.adminService.downloadInvoice(id);
    const byteArray = new Uint8Array(atob(response.data).split('').map(char => char.charCodeAt(0)));
    const file = new Blob([byteArray], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    let pdfName = "Invoice_" + invoice_id + ".pdf";
    this.utilityService.hideLoading();

    let link = document.createElement("a");
    link.download = pdfName;
    link.target = "_blank";
    link.href = fileURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  async getCampaignDetailsById(campaignId: number) {
    this.utilityService.showLoading();
    try {
      this.countryNames = '';
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
        // this.campaignDetailData = {};
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
        let successMessage = this.approved === 'REJECTED' ? 'Campaign has been rejected' : 'Campaign has been approved'
        this.toastr.success(successMessage);
        window.location.reload();
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
