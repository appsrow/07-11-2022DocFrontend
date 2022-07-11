import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  baseUrl = environment.apiUrl + 'api/v1/';
 
  constructor(private http: HttpClient) { }

  brandLogin(data:any): Promise<any>{
    return this.http.post(this.baseUrl + 'brands/login' , data).toPromise();
  }
 
  googleSignIn(idToken:any){
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=[API_KEY]`, {
      "postBody":`id_token=${idToken}&providerId=google.com`,
      "requestUri": 'http://localhost:4200',
      "returnIdpCredential":true,
      "returnSecureToken":true
    });
  }

}
