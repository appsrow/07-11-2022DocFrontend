import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import * as moment from 'moment';
import { UserList, UserListDetails } from '../../models/admin.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  userData:UserListDetails[]=[];
  constructor(
    private adminService: AdminService,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    ) { }

  ngOnInit(): void {
    this.getUserList();
  }                    
  async getUserList(){
      this.utilityService.showLoading();
      try {
        const res:UserList = await this.adminService.getAllUsers();
        if (res.success) {  
          this.utilityService.hideLoading();
          this.userData = res.data;
          for (var i = 0; i < this.userData.length; i++) {
            this.userData[i].converted_created_at = moment(this.userData[i].created_at).format('DD/MM/YYYY')
           }
          
          setTimeout(()=>{                          
            $('#userDatatable').DataTable( {
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
          this.utilityService.hideLoading();
          this.userData = [];
          setTimeout(()=>{                          
            $('#userDatatable').DataTable( {
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
