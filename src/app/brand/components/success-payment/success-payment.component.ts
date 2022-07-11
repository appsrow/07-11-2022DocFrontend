import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.scss']
})
export class SuccessPaymentComponent implements OnInit {

  emailConfirmationForm: FormGroup;
  static emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,30}|[0-9]{1,3})(\]?)$/;
  submitted: boolean = false;
  siteKey: string;
  closeModal!: string;
  error: string = '';
  successMessage: string = '';
  resetLinkSent: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private router: Router) {
    this.siteKey = environment.siteKey;
    this.emailConfirmationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
      recaptcha: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  goToHome() {
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }

  goToMyCampaigns() {
    this.router.navigate(['/brand/myCampaign']).then(() => {
      window.location.reload();
    });
  }
}
