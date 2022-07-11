import { Injectable } from '@angular/core';
import { BehaviorSubject, PartialObserver } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  baseUrl = environment.apiUrl + 'api/v1/';
  public coinUpdateObservable = new BehaviorSubject<string>('');
  
  constructor(
    private apiService: ApiService
  ) { }
  switchLanguage = new BehaviorSubject('es');
  pageName = new BehaviorSubject('');

  getTotalCoinsOfUser(userId: number): Promise<any> {
    return this.apiService.get(`${this.baseUrl}users/userwalletbalance`);
  }
  public subsribeToCoinUpdate(observer: PartialObserver<string>): void {
    this.coinUpdateObservable.subscribe(observer);
}

public sendCoinUpdateEvent(task: string) {
    this.coinUpdateObservable.next(task);
}
}

