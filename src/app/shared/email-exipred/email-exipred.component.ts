import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/user/services/user.service';
import { environment } from 'src/environments/environment';
import { GenericResponse } from '../models/shared.model';
import { UtilityService } from '../services/utility.service';

@Component({
  selector: 'app-email-exipred',
  templateUrl: './email-exipred.component.html',
  styleUrls: ['./email-exipred.component.scss']
})
export class EmailExipredComponent implements OnInit {
  emailExpiredForm: FormGroup = new FormGroup({});
  error: string = '';
  submitted: boolean = false;
  successMessage: string = '';
  resetLinkSent: boolean = false;
  modalReference!: NgbModalRef;
  siteKey: string = '';
  closeModal: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private userService: UserService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) { 
    this.siteKey = environment.siteKey;
    this.emailExpiredForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
      recaptcha: ['', Validators.required],
    });
    
  }

  ngOnInit(): void {
  }

  triggerModal(content: any) {
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' });
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
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

  async resendEmail() {
    this.submitted = true;
    if (this.emailExpiredForm.invalid) {
      return;
    }
    else {
      const emailData = {
        email: this.emailExpiredForm.value.email
      };
      
      this.utilityService.showLoading();
      try {
        this.successMessage = '';
        const response: GenericResponse = await this.userService.resendEmail(emailData);
        if (response.success) {
          // if (response.message === 'Email not found') {
          //   this.error = response.message;
          //   this.utilityService.hideLoading();
          //   return;
          // }
          this.resetLinkSent = true;
          this.error = '';
          this.successMessage = response.message;
          this.emailExpiredForm.controls.recaptcha.setValue('');
          this.toastr.success(this.successMessage);
          this.modalReference.close();
          this.utilityService.hideLoading();

        } else {
          this.successMessage = '';
          this.error = response.message;
          //throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
    }
  }

}
