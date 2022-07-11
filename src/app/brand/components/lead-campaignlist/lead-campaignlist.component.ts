import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { LeadCampaignResponseParameters } from '../../models/lead.model';
import { BrandService } from '../../services/brand.service';
import * as moment from 'moment';
@Component({
  selector: 'app-lead-campaignlist',
  templateUrl: './lead-campaignlist.component.html',
  styleUrls: ['./lead-campaignlist.component.scss']
})
export class LeadCampaignlistComponent implements OnInit {

  leadCampaigns : any;
  constructor(public utilityService: UtilityService, 
    private brandService: BrandService,
    private router: Router) { }

  ngOnInit() {
    this.getAllLeadCampaignList();
  }

  async getAllLeadCampaignList(){
    const response: LeadCampaignResponseParameters  = await this.brandService.getAllLeadCampaigns();
      if (response.success) {  
        this.leadCampaigns = response.data;
        for (var i = 0; i < this.leadCampaigns.length; i++) {
          this.leadCampaigns[i].converted_created_at = moment(this.leadCampaigns[i].created_at).format('DD/MM/YYYY')
        }
        setTimeout(()=>{                          
          $('#leadDataTable').DataTable( {
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu : [5, 10, 15],
            destroy: true
        } );
        }, 1);
      }else{
        this.leadCampaigns = [];
        setTimeout(()=>{                          
          $('#leadDataTable').DataTable( {
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu : [5, 10, 15],
            destroy: true,
            //order:[[1,"desc"]]
        } );
        }, 1);
      }
  }

  goToBrandUsers(campaignId: number){
    this.router.navigate(['brand/lead-users'], { queryParams: { campaignId: campaignId } });
  }
}
