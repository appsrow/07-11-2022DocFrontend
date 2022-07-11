import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import * as moment from 'moment';
import { NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatepickerOptions } from 'ng2-datepicker';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { Router } from '@angular/router';
import { ChangeStatusRequestParams, ChangeStatusResponse, GiftCardsList, GiftCardsListDetails, GiftCardTypes, InsertGiftCardRequestParams, InsertGiftCardResponse } from '../../models/admin.model';
import { HeaderService } from 'src/app/shared/services/header.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gift-card-details',
  templateUrl: './gift-card-details.component.html',
  styleUrls: ['./gift-card-details.component.scss']
})
export class GiftCardDetailsComponent implements OnInit {
  giftCarData: GiftCardsListDetails[] = [];
  modalReference!: NgbModalRef;
  closeModal!: string;
  isFBIframeLoaded: boolean = false;
  giftCardRewardForm: FormGroup;
  uploadMultipleGiftCardsForm: FormGroup;
  submitted: boolean = false;
  expiryDate: DatepickerOptions = {};
  pdfName: any;
  giftCardTypes: any;
  dropdownSettings = {};
  fileToUpload: string;
  fileError: string;
  fileName: string;

  options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    useBom: true,
    headers: ["No.", "card_code", "type", "amount", "price", "expiry_date"]
  };

  constructor(private adminService: AdminService,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private headerService: HeaderService,
    private httpClient: HttpClient) {
    this.giftCardRewardForm = this.formBuilder.group(
      {
        cardType: ['', [Validators.required]],
        cardCode: ['', [Validators.required]],
        coins: ['', [Validators.required]],
        amount: ['', [Validators.required]],
        currencyCode: ['EUR'],
        expiryDate: ['', [Validators.required]]
      }
    );
    this.uploadMultipleGiftCardsForm = this.formBuilder.group({
      giftCardsFile: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getGiftCardsList();
    this.getGiftCardTypes();
    this.expiryDate = {
      format: 'dd-MM-yyyy',
      placeholder: '',
      minDate: new Date()
    };
    this.dropdownSettings = {
      singleSelection: true,
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
  }

  async getGiftCardsList() {
    this.utilityService.showLoading();
    try {
      const res: GiftCardsList = await this.adminService.getAllGiftCardsData();
      if (res.success) {
        this.utilityService.hideLoading();
        this.giftCarData = res.data;

        for (var i = 0; i < this.giftCarData.length; i++) {
          this.giftCarData[i].converted_created_at = this.giftCarData[i].created_at ? moment(this.giftCarData[i].created_at).format('DD/MM/YYYY') : '';
          this.giftCarData[i].converted_expiry_date = this.giftCarData[i].expiry_date ? moment(this.giftCarData[i].expiry_date).format('DD/MM/YYYY') : '';
        }

        var datatable = $('#giftCarDatatable').DataTable();

        //datatable reloading 
        datatable.destroy();

        setTimeout(() => {
          $('#giftCarDatatable').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [5, 10, 15],
            destroy: true,
            order: []
          });
        }, 0.5);
      }
      else {
        this.utilityService.hideLoading();
        this.giftCarData = [];
        setTimeout(() => {
          $('#giftCarDatatable').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [5, 10, 15],
            destroy: true,
            order: []
          });
        }, 0.5);
      }
    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToFetchData');
      this.utilityService.hideLoading();
    }
  }

  triggerModal(content: any) {
    this.submitted = false;
    this.giftCardRewardForm.removeValidators;
    this.modalReference = this.modalService.open(content, { backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  triggerMultipleUploadModal(content: any) {
    this.submitted = false;
    this.uploadMultipleGiftCardsForm.removeValidators;
    this.modalReference = this.modalService.open(content, { backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  private getDismissReason(reason: any): string {
    this.fileName = '';
    this.giftCardRewardForm.reset();
    this.uploadMultipleGiftCardsForm.controls.giftCardsFile.setValue('');
    this.uploadMultipleGiftCardsForm.controls['giftCardsFile'].clearValidators();
    this.uploadMultipleGiftCardsForm.controls['giftCardsFile'].updateValueAndValidity();
    this.isFBIframeLoaded = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  async insertIntoGiftCards() {
    this.submitted = true;
    if (this.giftCardRewardForm.invalid) {
      return false;
    } else {
      const giftCardData: InsertGiftCardRequestParams = {
        'gift_card_code': this.giftCardRewardForm.controls.cardCode.value,
        'gift_card_type': this.giftCardRewardForm.controls.cardType.value[0].itemName,
        'coins': this.giftCardRewardForm.controls.coins.value,
        'gift_card_amount': this.giftCardRewardForm.controls.amount.value,
        'expiry_date': moment(this.giftCardRewardForm.controls.expiryDate.value).format('YYYY-MM-DD'),
        'currency_code': 'EUR',
        'status': 'AVAILABLE',
      }
      this.utilityService.showLoading();
      try {
        const res: InsertGiftCardResponse = await this.adminService.insertGiftCardData(giftCardData);

        if (res.success) {
          this.utilityService.hideLoading();
          this.utilityService.showSuccessToast('Gift card inserted successfully');
          this.modalReference.close();
          this.getGiftCardsList();
          this.giftCardRewardForm.reset();
        } else {
          throw new Error(res.message);
        }
      }
      catch (error) {
        this.utilityService.showErrorToast('toast.failedToUpdate');
        this.utilityService.hideLoading();
      }
    }
  }

  async toggleGiftCardStatus(event: any, gift_card_id: any) {
    let status = event.target.checked ? 'AVAILABLE' : 'NOT_AVAILABLE';
    if (gift_card_id === '' || event.target.checked === '') {
      return false;
    }
    try {
      this.utilityService.showLoading();
      const giftCardData: ChangeStatusRequestParams = {
        'gift_card_id': gift_card_id,
        'status': status
      };

      const res: ChangeStatusResponse = await this.adminService.changeGiftCardStatus(giftCardData);

      if (res.success) {
        this.utilityService.hideLoading();
        this.toastr.success('Gift card status updated');
        this.getGiftCardsList();
      } else {
        this.utilityService.hideLoading();
        throw new Error(res.message);
      }
    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToUpdate');
      this.utilityService.hideLoading();
    }
  }

  downloadExcel() {
    new ngxCsv([], "GiftCards", this.options);
  }

  async getGiftCardTypes() {
    this.utilityService.showLoading();
    try {
      const response: GiftCardTypes = await this.adminService.getGiftCardTypes();
      if (response.success) {
        this.giftCardTypes = response.data;
      }
      this.utilityService.hideLoading();
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGiftCardsType');
      this.utilityService.hideLoading();
    }
  }

  onSelectCampaignFile(event: any) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      this.fileName = event.target.files[0].name;
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        let filePath = file.name;
        let allowedExtensions = /(\.xlsx|\.xls|\.csv)$/i;
        if (!allowedExtensions.exec(filePath)) {
          this.headerService.switchLanguage.subscribe(res => {
            if (res == 'es') {
              this.fileError = 'Excel debe estar en formato csv, xlsx o xls';
            } else {
              this.fileError = 'Excel should be in csv, xlsx or xls format';
            }
          });
          return this.fileError;
        } else {
          this.fileError = '';
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event: any) => {
            this.fileToUpload = event.target.result;
          }
        }
      }
    }
  }

  async importMultipleData() {
    this.submitted = true;
    this.uploadMultipleGiftCardsForm.controls['giftCardsFile'].setValidators([Validators.required]);
    this.uploadMultipleGiftCardsForm.controls['giftCardsFile'].updateValueAndValidity();
    if ((this.uploadMultipleGiftCardsForm.invalid || this.fileError != '')) {
      return false;
    } else {
      this.utilityService.showLoading();
      try {
        const formData: any = {
          'file': this.fileToUpload
        }

        const response: any = await this.adminService.importMultipleGiftCards(formData);
        if (response.success) {
          this.utilityService.showSuccessToast(response.message);
          this.fileName = '';
          this.giftCardRewardForm.reset();
          this.uploadMultipleGiftCardsForm.controls.giftCardsFile.setValue('');
          this.uploadMultipleGiftCardsForm.controls['giftCardsFile'].clearValidators();
          this.uploadMultipleGiftCardsForm.controls['giftCardsFile'].updateValueAndValidity();
          this.modalReference.close();
          this.getGiftCardsList();
        } else {
          this.utilityService.showErrorToast(response.message);
        }
        this.utilityService.hideLoading();
      } catch (error) {
        this.utilityService.showErrorToast('toast.failedGiftCardsType');
        this.utilityService.hideLoading();
      }
    }
  }



}
