import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountDetail } from './models/shared.model';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  
  constructor(
    public authService: AuthService,
    public router: Router
  ){ }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn !== true) {
        this.router.navigate(['home']);
    } else {
        const data = window.localStorage.getItem('loginDetail');
        if (data) {
            const accountDetail = JSON.parse(data);
            if (state.url.includes('brand') === true && accountDetail.user_info.user_type !== '1') {
                this.router.navigate(['home']);
            } else if (state.url.includes('user') === true && accountDetail.user_info.user_type !== '2') {
                this.router.navigate(['home']);
            }
        }
        // return false;
    }
    return true;
  }

}