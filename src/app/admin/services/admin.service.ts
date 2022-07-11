import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import { LoginRequestParameters, LoginResponseData,} from 'src/app/shared/models/shared.model';
import { UserList, UserDetails, PaymentDetailsList,CampaignStatisticsParameters,CampaignStatisticsDataList, ReportList, ReportDataParameters, ChangeStatusDataParameters,ChangeStatusData, CampaignList, DashboardBrandList, DashboardCount, HighestpPaidCampaignsParameters, HighestpPaidCampaigns, InvoiceList, DownloadInvoice, Brand, BrandDetailsData, CampaignListObject, ApprovedOrRejectCampaignData, ApprovedOrRejectCampaignParameters, GiftCardsList, InsertGiftCardRequestParams, InsertGiftCardResponse, ChangeStatusRequestParams, ChangeStatusResponse } from '../models/admin.model';
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = environment.apiUrl + 'api/v1/';
  public invokeEvent = new BehaviorSubject('invokeEvent');

  constructor(
    private apiService: ApiService
  ) { }

  adminLogin(data: LoginRequestParameters): Promise<LoginResponseData> {
    return this.apiService.post<LoginResponseData>(this.baseUrl + 'admin/login', data);
  }
  getAllUsers(): Promise<UserList> {
    return this.apiService.post<UserList>(this.baseUrl + 'admin/getallusers', '');
  }
  editUsers(data: number): Promise<UserDetails> {
    return this.apiService.get<UserDetails>(`${this.baseUrl}admin/getuserbyid/${data}`);
  }
  changeUserStatus(data: ChangeStatusDataParameters): Promise<ChangeStatusData> {
    return this.apiService.post<ChangeStatusData>(this.baseUrl + 'admin/userstatus', data);
  }
  getAllBrands(): Promise<Brand> {
    return this.apiService.post<Brand>(this.baseUrl + 'admin/getallbrands', '');
  }
  editBrands(data: number): Promise<BrandDetailsData> {
    return this.apiService.get<BrandDetailsData>(`${this.baseUrl}admin/getbrandbyid/${data}`);
  }
  getCampaignList(): Promise<CampaignList> {
    return this.apiService.post<CampaignList>(this.baseUrl + 'admin/getallcampaign', '');
  }
  getCampaignDetailsDataById(campaignId: number): Promise<CampaignListObject> {
    return this.apiService.get<CampaignListObject>(`${this.baseUrl}admin/getcampaignbyid/${campaignId}`);
  }
  approveOrRejectCampaign(data: ApprovedOrRejectCampaignParameters): Promise<ApprovedOrRejectCampaignData> {
    return this.apiService.post<ApprovedOrRejectCampaignData>(this.baseUrl + 'admin/campaignapproval', data);
  }
  getCampaignStatisticsData(data: CampaignStatisticsParameters): Promise<CampaignStatisticsDataList> {
    return this.apiService.post<CampaignStatisticsDataList>(this.baseUrl + 'brands/campaignstatistics', data);
  }
  getAllInvoices(): Promise<InvoiceList> {
    return this.apiService.post<InvoiceList>(this.baseUrl + 'admin/invoices', '');
  }
  getPaymentdetail(brandId: number): Promise<PaymentDetailsList> {
    return this.apiService.get<PaymentDetailsList>(`${this.baseUrl}admin/GetPaymentHistoryByBrandId/${brandId}`);
  }
  downloadInvoice(invoiceId: number): Promise<DownloadInvoice>{
    return this.apiService.get<DownloadInvoice>(`${this.baseUrl}admin/DownloadInvoice/${invoiceId}`);
  }
  getDashboardCount(): Promise<DashboardCount> {
    return this.apiService.get<DashboardCount>(`${this.baseUrl}admin/dashboard/counts`);
  }
  getRegisteredBrands(year: string): Promise<DashboardBrandList> {
    return this.apiService.get<DashboardBrandList>(`${this.baseUrl}admin/dashboard/brands/${year}`);
  }
  getHighestPaidCampaigns(data: HighestpPaidCampaignsParameters): Promise<HighestpPaidCampaigns> {
    return this.apiService.post<HighestpPaidCampaigns>(this.baseUrl + 'admin/dashboard/campaigns', data);
  }
  getReportData(data: ReportDataParameters): Promise<ReportList> {
    return this.apiService.post<ReportList>(this.baseUrl + 'admin/report/campaign', data);
  }
  getAllGiftCardsData(){
    return this.apiService.get<GiftCardsList>(`${this.baseUrl}admin/getAllGiftCards`);
  }
  insertGiftCardData(data: InsertGiftCardRequestParams){
    return this.apiService.post<InsertGiftCardResponse>(this.baseUrl + 'admin/addGiftCard', data);
  }
  changeGiftCardStatus(data:ChangeStatusRequestParams){
    return this.apiService.post<ChangeStatusResponse>(this.baseUrl + 'admin/changeGiftCardStatus', data);
  }
  getGiftCardTypes(): Promise<any> {
    return this.apiService.get(this.baseUrl + 'admin/get_gift_card_types');
  }
  importMultipleGiftCards(data:any){
    return this.apiService.post<any>(this.baseUrl + 'admin/importMultipleGiftCardData', data);
  }
  getDashboardKpis(data:any){
    return this.apiService.post<any>(this.baseUrl + 'admin/getDashboardKpis', data);
  }
}
