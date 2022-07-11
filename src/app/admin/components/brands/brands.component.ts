import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { Brand, BrandDetailsInformation } from '../../models/admin.model';
import * as moment from 'moment';
@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  brandData:BrandDetailsInformation[] = [];
  constructor(
    private adminService: AdminService,
    public utilityService: UtilityService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getBrandList();
  }                    
  async getBrandList(){
      this.utilityService.showLoading();
      try {
        const res: Brand =  await this.adminService.getAllBrands();
        
        if (res.success) {  
          this.utilityService.hideLoading();
          this.brandData = res.data;
          for (var i = 0; i < this.brandData.length; i++) {
           this.brandData[i].converted_created_at = moment(this.brandData[i].created_at).format('DD/MM/YYYY')
          }
          setTimeout(()=>{                          
            $('#brandDataTable').DataTable( {
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              lengthMenu : [5, 10, 15],
              destroy: true,
              order: []
          } );
          }, 1);
        }
        else{
          this.brandData = [];
          setTimeout(()=>{                          
            $('#brandDataTable').DataTable( {
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              lengthMenu : [5, 10, 15],
              destroy: true,
              order: []
          } );
          }, 1);
        }
      }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToFetchData');
      this.utilityService.hideLoading();
    }
  }
}
