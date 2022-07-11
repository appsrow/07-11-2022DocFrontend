import { Injectable } from '@angular/core';
import { GenericResponse, ResetPasswordRequestParameters, ChangePasswordRequestParameters, LoginRequestParameters, LoginResponseData } from 'src/app/shared/models/shared.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import { CreateAppsDownloadCampaignRequestParameters, CreateClicksOnWebsiteCampaignRequestParameters, CreateFollowCampaignRequestParameters, CreateLeadCampaignRequestParameters, CreateVideoCampaignRequestParameters, getHighestCacRequestParameters } from '../models/campaign.model';
import { BrandProfileData, UpdateBrandProfileData, UpdateBrandProfileRequestParameters } from '../models/profile.model';
import { BrandRegistrationData, BrandRegistrationRequestParameters, BrandRegistrationResponseValue, EmailConfirmationRequestParameters } from '../models/registration.model';
import { WalletDetailData } from '../models/wallet.model';
import { InvoiceDetailData } from '../models/invoice.model';
import { LeadCampaignResponseParameters, LeadUsersResponseParameters } from '../models/lead.model';
import { StatisticsResponseData } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  baseUrl = environment.apiUrl + 'api/v1/';

  constructor(
    private apiService: ApiService
  ) {

  }

  brandRegister(data: BrandRegistrationRequestParameters): Promise<BrandRegistrationResponseValue> {
    return this.apiService.post<BrandRegistrationResponseValue>(this.baseUrl + 'brands/register', data);
  }

  brandLogin(data: LoginRequestParameters): Promise<LoginResponseData> {
    return this.apiService.post<LoginResponseData>(this.baseUrl + 'brands/login', data);
  }

  forgotPassword(data: string): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'brands/forgotpassword', data);
  }

  resetPassword(data: ResetPasswordRequestParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'brands/resetpassword', data);
  }
  changePassword(data: ChangePasswordRequestParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'brands/changepassword', data);
  }
  resendEmail(data: EmailConfirmationRequestParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'brands/resend_confirm_email', data);
  }

  createCampaign(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/leads', data);
  }

  createCampaignForLead(data: CreateLeadCampaignRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/leads', data);
  }

  createCampaignForVideoPlays(data: CreateVideoCampaignRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/video', data);
  }

  createCampaignForFollow(data: CreateFollowCampaignRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/follow', data);
  }

  createCampaignForAppsdownload(data: CreateAppsDownloadCampaignRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/app_download', data);
  }

  createCampaignForClickWebsite(data: CreateClicksOnWebsiteCampaignRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/click_website', data);
  }

  createCampaignForQuestions(data: CreateLeadCampaignRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/questionForm', data);
  }

  getMinimumCAC(data: { target_id: string }): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/createcampaign/minimumcac', data);
  }

  getBrandProfile(): Promise<BrandProfileData> {
    return this.apiService.post<BrandProfileData>(this.baseUrl + 'brands/get_brand_profile_by_id', '');
  }

  updateBrandProfile(data: UpdateBrandProfileRequestParameters): Promise<UpdateBrandProfileData> {
    return this.apiService.post<UpdateBrandProfileData>(`${this.baseUrl}brands/profile`, data);
  }

  getPreviewData(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/getcampaignbyid', data);
  }

  getCurrentCampaignLists(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/current_campaign', data);
  }

  getProgrammedCampaignLists(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/programmed_campaign', data);
  }

  getFinishedCampaignLists(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/finished_campaign', data);
  }

  startStopCampaignById(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/startstoprunningcampaign', data);
  }

  getProgrammedCampaignById(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/getprogrammedcampaignbyid', data);
  }

  editProgrammedCampaign(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/editprogrammedcampaign', data);
  }

  getCampaignPosition(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/getcampaignposition', data);
  }

  paypalBrandPayment(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/payment', data);
  }

  getBrandWalletDetails(): Promise<WalletDetailData> {
    return this.apiService.post<WalletDetailData>(this.baseUrl + 'brands/brandspendoncampaign', '');
  }
  getInvoice(): Promise<InvoiceDetailData> {
    return this.apiService.post<InvoiceDetailData>(this.baseUrl + 'brands/invoices', '');
  }
  downloadInvoice(data: any) {
    return this.apiService.get(`${this.baseUrl}brands/downloadPDF/${data}`);
  }

  getCampaignStatisticsData(data: any): Promise<StatisticsResponseData> {
    return this.apiService.post<StatisticsResponseData>(this.baseUrl + 'brands/campaignstatistics', data);
  }

  getAllLeadCampaigns(): Promise<LeadCampaignResponseParameters> {
    return this.apiService.post<LeadCampaignResponseParameters>(this.baseUrl + 'brands/getleadcampaign', '');
  }

  getCampaignUsers(campaignId: number): Promise<LeadUsersResponseParameters> {
    return this.apiService.get(`${this.baseUrl}brands/getuserbyleadcampaign/${campaignId}`);
  }

  getCampaignById(data: any): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/getcampaignbyid', data);
  }

  getMaximumCacByCampaignType(campaignType: getHighestCacRequestParameters): Promise<any> {
    return this.apiService.post(this.baseUrl + 'brands/GetMaxCacByCampaignType', campaignType);
  }

  paypalbrandUpdateCampaignWithBudget(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/UpdateCampaignBudget', data);
  }

  getQuestionTypes(): Promise<any> {
    return this.apiService.get<any>(this.baseUrl + 'brands/getQuestionTypes');
  }

  insertFormData(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/addCampaignForm', data);
  }

  insertCampaignFormQuestions(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/addCampaignFormQuestions', data);
  }

  getMetricsLinkData(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/generateMetricsLink', data);
  }

  insertMetricsLinkData(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/saveMetricsLink', data);
  }

  getCampaignQuestions(data: any): Promise<LeadUsersResponseParameters> {
    return this.apiService.post(this.baseUrl + 'brands/getAllQuestionsReport', data);
  }

  getQuestionAnswers(data: any) {
    return this.apiService.post(this.baseUrl + 'brands/getQuestionAnswers', data);
  }

}
