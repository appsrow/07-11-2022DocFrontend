import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '../services/header.service';
@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {
  policyName:string;
  constructor(
    private route: ActivatedRoute,
    public translateService: TranslateService,
    private headerService: HeaderService
  ) {
    this.route.queryParams.subscribe(params => {
      this.policyName = params.policies;
    })
   }

  ngOnInit(): void {
   
  
  }

}
