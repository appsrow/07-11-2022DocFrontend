import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../services/header.service';
import { AccountDetail } from '../models/shared.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  isLoggedIn: boolean = false;
  accountDetail: AccountDetail;
  selectedLanguage:any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private headerService: HeaderService
  ) 
  { 
    this.headerService.switchLanguage.subscribe(res => {
      // this.switchLanguage = res;
      // translateService.setDefaultLang(res);
      // translateService.use(res);
      const loginDetail: any = window.localStorage.getItem('loginDetail');
      if (loginDetail) {
        this.accountDetail = JSON.parse(loginDetail);
        this.isLoggedIn = true;
      }
    })
  }

  ngOnInit(): void {
    
  }

  goToPrivacy(policy: string) {
    if (window.localStorage.getItem('selectedLanguage') === 'es') {
      this.router.navigate(['policies-es'], { queryParams: { policies: policy }});
    } else {
      this.router.navigate(['policies'], { queryParams: { policies: policy }});
    }
  }
  goToHowitWorks(HowitWorks:string)
  {
    this.router.navigate(['home'], { queryParams: { section: HowitWorks }});
  }
}
