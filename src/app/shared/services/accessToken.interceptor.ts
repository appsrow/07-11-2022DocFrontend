import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService,
    private toastr: ToastrService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    const authReq = request.clone({
      headers: new HttpHeaders(this.getToken())
    });
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403 || error.status === 401) {
          this.handleAuthError();
        }
        return throwError(error.error);
      })
    );
  }

  handleAuthError() {
    this.authService.logout();
    return throwError('Session has expired. Please login again');
  }

  getToken(): any {
    const currentUser: any = localStorage.getItem('loginDetail') ? window.localStorage.getItem('loginDetail') : window.localStorage.getItem('googleloginToken');
    const currentUserString: any = JSON.parse(currentUser);

    if (currentUser && currentUserString.api_token) {
      return {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + currentUserString.api_token,
        'Selected-Language': localStorage.getItem('selectedLanguage')
      }
    } else {
      return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Selected-Language': localStorage.getItem('selectedLanguage')
      }
    }
  }
}
