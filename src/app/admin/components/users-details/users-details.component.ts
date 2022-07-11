import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import { UserListDetails, UserDetails, ChangeStatusData, ChangeStatusDataParameters } from '../../models/admin.model';
import { take } from 'rxjs/operators';
import { ModalService } from '../../model.service';
import { HeaderService } from 'src/app/shared/services/header.service';
@Component({
  selector: 'app-users-details',
  templateUrl: './users-details.component.html',
  styleUrls: ['./users-details.component.scss']
})
export class UsersDetailsComponent implements OnInit {
  id: any;
  userData: UserListDetails;
  profilePicture: string = '';
  activeValue: number;
  isChecked: boolean;
  confirmedResult: boolean;
  activeResult: string = '';
  areYouSureString = '';
  constructor(
    private adminService: AdminService,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public modalService: ModalService,
    public headerService: HeaderService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getUserData();
  }
  checkStatusValue(event: { checked: any; }) {
    this.isChecked = event.checked;
    if (event.checked == true) {
      this.activeResult = "active"
    }
    else {
      this.activeResult = "inactive"
    }

    this.headerService.switchLanguage.subscribe(res => {
      if (res == 'es') {
        this.areYouSureString = 'Estas segura quieres ';
      } else {
        this.areYouSureString = 'Are you sure, you want to ';
      }
    });
   
    this.modalService.confirm(this.areYouSureString + this.activeResult + '?').pipe(take(1)).subscribe((result: any) => {
      this.confirmedResult = result;
      if (this.confirmedResult == true) {
        this.changeUserStatus();
      }
      else {
        if (this.activeResult == "active") {
          this.isChecked = false;
        }
        else {
          this.isChecked = true;
        }
      }
    });

  }
  async getUserData() {
    this.utilityService.showLoading();
    try {
      const res: UserDetails = await this.adminService.editUsers(this.id);
        if (res.success) {
          this.utilityService.hideLoading();
          this.userData = res.data;
          res.data.user_photo ? this.profilePicture = res.data.user_photo : '';
          if (res.data.active == 1) {
            this.isChecked = true;
          } else {
            this.isChecked = false;
          }
        }
        else {
          this.utilityService.hideLoading();
        }
     
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedToFetchData');
      this.utilityService.hideLoading();
    }
  }


  async changeUserStatus() {
    if (this.isChecked == true) {
      this.activeValue = 1;
    } else {
      this.activeValue = 0;
    }
    const userStatusData: ChangeStatusDataParameters = {
      user_id: this.id,
      active: this.activeValue
    };
    this.utilityService.showLoading();
    try {
      const res: ChangeStatusData = await this.adminService.changeUserStatus(userStatusData);
        if (res.success) {
          this.utilityService.hideLoading();
          this.utilityService.showSuccessToast('toast.userStatusChanged');
          this.router.navigate(['/admin/users']);
        } else {
          this.utilityService.hideLoading();
        }
      
    }
    catch (error) {
      this.utilityService.showErrorToast('toast.failedToUpdate');
      this.utilityService.hideLoading();
    }
  }
}
