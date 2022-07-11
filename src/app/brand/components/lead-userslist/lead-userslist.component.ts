import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { InvoiceDetailData } from '../../models/invoice.model';
import { BrandService } from '../../services/brand.service';
import * as XLSX from 'xlsx';
import { LeadUsersResponseParameters } from '../../models/lead.model';
@Component({
  selector: 'app-lead-userslist',
  templateUrl: './lead-userslist.component.html',
  styleUrls: ['./lead-userslist.component.scss']
})
export class LeadUserslistComponent implements OnInit {

  brandUsersList: any;
  brandCampaignData: any;
  campaignId: any;
  leadName:any
  fileName: any; 
  
  constructor(public utilityService: UtilityService, 
    private brandService: BrandService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getBrandUsers();
  }
  exportToExcel(): void 
  {
     let element = document.getElementById('leadUserDataTable'); 
     const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
     const wb: XLSX.WorkBook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
     this.fileName = "Lead_" + this.leadName + ".xlsx";
     XLSX.writeFile(wb, this.fileName);
  }
  async getBrandUsers(){
    await this.route.queryParams.subscribe(
      params => {
        this.campaignId = params.campaignId;
      }
    )

    const response: LeadUsersResponseParameters = await this.brandService.getCampaignUsers(this.campaignId);

    if (response.success && response.data.campaign_details) {  
      if(response.data.user_details){
        this.brandUsersList = response.data.user_details;
      }else{
        this.brandUsersList = [];
      }
      this.brandCampaignData = response.data.campaign_details;
      this.leadName = this.brandCampaignData.campaign_name;
      setTimeout(()=>{                          
        $('#leadUserDataTable').DataTable({
          pagingType: 'full_numbers',
          pageLength: 10,
          processing: true,
          lengthMenu : [5, 10, 15],
          destroy: true,
          //order:[[1,"desc"]]
        } );
      }, 1);
    }else{
      this.brandUsersList = [];
      this.brandCampaignData = [];
      setTimeout(()=>{                          
        $('#leadUserDataTable').DataTable( {
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

}
