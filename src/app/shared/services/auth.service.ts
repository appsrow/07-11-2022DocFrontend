import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = environment.apiUrl + 'api/v1/';
  constructor(private myRouter: Router,
    private apiService: ApiService,
    private toastr: ToastrService) { }

  get isLoggedIn(): boolean {
    const loginData = window.localStorage.getItem('loginDetail');
    return loginData ? true : false;
  }

  getLoggedInUserDetail() {
    const data = window.localStorage.getItem('loginDetail');
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  // isLoggedIn() {
  //   if (window.localStorage.getItem('loginDetail')) {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // }

  getAccessToken() {
    let token = localStorage.getItem('loginDetail');
    if (token) {
      return JSON.parse(token);
    } else {
      return null;
    }
  }

  logout() {
    // check if its brand login
    //let loginType = this.brandLoggedIn();
    if (this.brandLoggedIn()) {
      // if its brand login 
      this.brandLogout();
    }
    else if (this.adminLoggedIn()) {
      // if its admin login 
      this.adminLogout();
    }
    else {
      // if user is login
      this.userLogout();
    }
    window.localStorage.removeItem('userDetail');
    window.localStorage.removeItem('loginDetail');
    localStorage.removeItem('LoggedInToken');
    localStorage.removeItem('GrantedUser');
    localStorage.removeItem('InstaUserName');
  }
  adminLoggedIn() {
    let checkUser = this.getAccessToken();
    if (checkUser && checkUser.user_info.user_type == '3') {
      return this.getAccessToken() !== null;
    }
  }
  userLoggedIn() {
    let checkUser = this.getAccessToken();
    if (checkUser && checkUser.user_info.user_type == '2') {
      return this.getAccessToken() !== null;
    }
  }

  brandLoggedIn() {
    let checkUser = this.getAccessToken();
    if (checkUser && checkUser.user_info.user_type == '1') {
      return this.getAccessToken() !== null;
    }
  }

  brandLogout() {
    this.myRouter.navigate(['/brand/login']).then(() => {
      window.location.reload();
    })
    return this.apiService.get(this.baseUrl + 'brands/logout');
  }

  userLogout() {
    this.myRouter.navigate(['/user/login']).then(() => {
      window.location.reload();
    })
    return this.apiService.get(this.baseUrl + 'users/logout');
  }
  adminLogout() {
    this.myRouter.navigate(['/admin/login']).then(() => {
      window.location.reload();
    })
    return this.apiService.get(this.baseUrl + 'admin/logout');
  }
}
