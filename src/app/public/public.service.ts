import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StatisticsResponseData } from '../brand/models/statistics.model';
import { ApiService } from '../shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  baseUrl = environment.apiUrl + 'api/v1/';
  constructor(private apiService: ApiService) { }

  getCampaignStatisticsData(data: any): Promise<StatisticsResponseData> {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'viewCampaignStatistics', data);
  }

  checkCampaignLink(data: any) {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'checkCampaignLink', data);
  }

  checkCampaignLinkAndPassword(data: any) {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'checkCampaignLinkAndPassword', data);
  }

  checkReferralLink(data: any) {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'checkAmbassadorLink', data);
  }

  checkAmbassadorLinkAndPassword(data: any) {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'checkAmbassadorLinkAndPassword', data);
  }

  getAmbassadorsStatisticsData(data: any): Promise<StatisticsResponseData> {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'viewAmbassadorsStatistics', data);
  }

  showStreamerSubscriptions() {
    return this.apiService.get(this.baseUrl + 'viewTopStreamers');
  }
}
