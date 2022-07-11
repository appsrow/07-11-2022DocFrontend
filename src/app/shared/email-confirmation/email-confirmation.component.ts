import { Component, OnInit } from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.scss']
})
export class EmailConfirmationComponent implements OnInit {
  emailconfirmationForm: FormGroup;
  static emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  submitted: boolean = false;
  siteKey: string;
  closeModal!: string;
  
  constructor(private formBuilder: FormBuilder,private modalService: NgbModal, private route: ActivatedRoute, private router: Router) {
    this.siteKey = environment.siteKey;
    this.emailconfirmationForm = this.formBuilder.group({
     Email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
     recaptcha: ['',Validators.required], 
    });
  }
    
  triggerModal(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    }, (res) => {
      this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    });
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  ngOnInit(): void {
  }
  userActivation(): void{
    this.submitted=true;
    if (this.emailconfirmationForm.invalid) {
        return;
    }
  }

  goToHome() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || './home';
    this.router.navigate([returnUrl]);
  }

  goToLogin() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || './user/login';
    this.router.navigate([returnUrl]);
  }
}
