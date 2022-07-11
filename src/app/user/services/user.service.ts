import { Injectable } from '@angular/core';
import { EmailConfirmationParameters, GenericResponse, LoginResponseData, LoginRequestParameters, ResetPasswordRequestParameters, ChangePasswordRequestParameters, UserCoinsData } from 'src/app/shared/models/shared.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import { RedeemRewardsRequestParameters, UserProfileData, UserProfileRequestParameters } from '../models/profile.model';
import { Country, GoogleLoginData, GoogleLoginRequestParameters, RegisterData, RegistrationRequestParameters, RequestSmsRequestData, RequestSmsResponseData, State, VerifyCodeRequestData } from '../models/registration.model';
import { CompleteTaskData, CompleteTaskRequestParameters, CampaignClickedParameters, CampaignClickedData, Rewards, RewardsRequestParameters, Task, TaskParameters, twitterAuthDetails, twitterAuth2Parameters, twitterAuth2, paypalRewardDataParameters } from '../models/user-task.model';
import { SearchStreamerRequestData, SearchStreamerResponse, TwitchPromotedStreamersListRequestData, TwitchPromotedStreamersListResponseData, TwitchSubscriptionRequestData, TwitchSubsriptionResponseData, UserProfileDataResponse } from '../models/user-twitch.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.apiUrl + 'api/v1/';

  constructor(
    private apiService: ApiService
  ) { }

  register(data: RegistrationRequestParameters): Promise<RegisterData> {
    return this.apiService.post<RegisterData>(this.baseUrl + 'users/register', data);
  }

  login(data: LoginRequestParameters): Promise<LoginResponseData> {
    return this.apiService.post<LoginResponseData>(this.baseUrl + 'users/login', data);
  }

  forgotPassword(data: EmailConfirmationParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'users/forgotpassword', data);
  }

  resetPassword(data: ResetPasswordRequestParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'users/resetpassword', data);
  }
  changePassword(data: ChangePasswordRequestParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'users/changepassword', data);
  }

  resendEmail(data: EmailConfirmationParameters): Promise<GenericResponse> {
    return this.apiService.post<GenericResponse>(this.baseUrl + 'users/resend_confirm_email', data);
  }

  getCountries(): Promise<Country> {
    return this.apiService.get<Country>(this.baseUrl + 'users/country');
  }

  getStates(countryId: number): Promise<State> {
    return this.apiService.get<State>(`${this.baseUrl}users/state/${countryId}`);
  }

  getAllTask(data: TaskParameters): Promise<Task> {
    return this.apiService.post<Task>(this.baseUrl + 'users/tasks', data);
  }

  googleLogin(data: GoogleLoginRequestParameters): Promise<GoogleLoginData> {
    return this.apiService.post<GoogleLoginData>(this.baseUrl + 'users/social_login', data);
  }
  getProfile(): Promise<UserProfileData> {
    return this.apiService.post<UserProfileData>(`${this.baseUrl}users/get_user_profile_by_id`, '');
  }
  updateMyProfile(data: UserProfileRequestParameters): Promise<UserProfileData> {
    return this.apiService.post<UserProfileData>(`${this.baseUrl}users/profile`, data);
  }

  completeTask(data: CompleteTaskRequestParameters): Promise<CompleteTaskData> {
    return this.apiService.post<CompleteTaskData>(this.baseUrl + 'users/creditoncampaigncomplete', data);
  }
  campaignClicked(data: CampaignClickedParameters): Promise<CampaignClickedData> {
    return this.apiService.post<CampaignClickedData>(this.baseUrl + 'users/campaignclicked', data);
  }
  getRewards(data: RewardsRequestParameters): Promise<Rewards> {
    return this.apiService.post<Rewards>(this.baseUrl + 'users/get_all_rewards', data);
  }

  getTotalCoinsOfUser(): Promise<UserCoinsData> {
    return this.apiService.post<UserCoinsData>(`${this.baseUrl}users/userwalletbalance`, '');
  }

  getUserPaypalReward(data: paypalRewardDataParameters): Promise<CompleteTaskData> {
    return this.apiService.post<CompleteTaskData>(this.baseUrl + 'users/redeemrewards', data);
  }

  getAlreadyRedeemRewards(): Promise<RedeemRewardsRequestParameters> {
    return this.apiService.get<RedeemRewardsRequestParameters>(this.baseUrl + 'users/redeemrewards/list');
  }

  getAllCompletedTask(data: TaskParameters): Promise<Task> {
    return this.apiService.post<Task>(this.baseUrl + 'users/alreadycompletedtask', data);
  }
  gettwitterAuth(): Promise<twitterAuthDetails> {
    return this.apiService.post<twitterAuthDetails>(this.baseUrl + 'users/Twitter_Auth', '');
  }
  gettwitterAuth2(data: twitterAuth2Parameters): Promise<twitterAuth2> {
    return this.apiService.post<twitterAuth2>(this.baseUrl + 'users/TwitterSecondApi', data);
  }

  getTwitchPromotedStreamersList(data: TwitchPromotedStreamersListRequestData) {
    return this.apiService.post<TwitchPromotedStreamersListResponseData>(this.baseUrl + 'users/twitch/promotedlist', data);
  }

  getUserProfileData(id: string) {
    return this.apiService.get<UserProfileDataResponse>(this.baseUrl + 'users/twitch/profile/' + id);
  }

  searchStreamer(data: SearchStreamerRequestData) {
    return this.apiService.post<SearchStreamerResponse>(this.baseUrl + 'users/twitch/search', data);
  }

  twitchSubscribe(data: TwitchSubscriptionRequestData) {
    return this.apiService.post<TwitchSubsriptionResponseData>(this.baseUrl + 'users/twitch/subscribe', data);
  }

  getAllGiftCardsType() {
    return this.apiService.get(this.baseUrl + 'users/get_all_gift_card_types');
  }

  getGiftCardTypes(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'users/get_gift_card_type_info', data);
  }

  redeemGiftCard(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'users/redeem_gift_cards', data);
  }

  checkReferralLink(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'twitch/checkStreamerLink', data);
  }

  requestVerificationCode(data: RequestSmsRequestData) {
    return this.apiService.post<RequestSmsResponseData>(this.baseUrl + 'users/send_verification_code', data);
  }

  checkVerificationCode(data: VerifyCodeRequestData) {
    return this.apiService.post<RequestSmsResponseData>(this.baseUrl + 'users/verifySmsCode', data);
  }

  showCampaignQuestions(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'users/get_all_form_questions', data);
  }

  submitCampaignAnswers(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'users/addUserFormAnswers', data);
  }

  instaAuth(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'get_insta_access_token', data);
  }

  getInstaProfile(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'get_insta_user_name', data);
  }

  saveInstagramData(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'users/instagramFollows', data);
  }

  checkInstagramFollow(data: any) {
    return this.apiService.post<any>(this.baseUrl + 'users/checkInstagramFollow', data);
  }
}
