import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user.service';
import { GenericResponse } from 'src/app/shared/models/shared.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.scss']
})
export class EmailConfirmationComponent implements OnInit {

  emailconfirmationForm: FormGroup;
  submitted: boolean = false;
  siteKey: string;
  closeModal: string = '';
  error: string = '';
  successMessage: string = '';
  resetLinkSent: boolean = false;
  modalReference!: NgbModalRef;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private utilityService: UtilityService,
    private toastr: ToastrService
  ) {
    this.siteKey = environment.siteKey;
    this.emailconfirmationForm = this.formBuilder.group({
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
    if (this.emailconfirmationForm.invalid) {
      return;
    }
    else {
      const emailData = {
        email: this.emailconfirmationForm.value.email
      };
      
      this.utilityService.showLoading();
      try {
        this.successMessage = '';
        const response: GenericResponse = await this.userService.resendEmail(emailData);
        if (response.success) {
          this.resetLinkSent = true;
          this.error = '';
          this.successMessage = response.message;
          this.emailconfirmationForm.controls.recaptcha.setValue('');
          this.toastr.success(this.successMessage);
          this.modalReference.close();
          this.utilityService.hideLoading();

        } else {
          this.utilityService.hideLoading();
          this.successMessage = '';
          this.error = response.message;
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/user/login']);
  }
  
}
