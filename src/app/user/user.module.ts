import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { NgxCaptchaModule } from 'ngx-captcha';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { DatepickerModule } from 'ng2-datepicker';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { GoogleLoginProvider } from 'angularx-social-login';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { AuthGuard } from '../shared/auth.guard';
import { UserTasksComponent } from './components/user-tasks/user-tasks.component';
import { UserRewardsComponent } from './components/user-rewards/user-rewards.component';
import { UserEditProfileComponent } from './components/user-edit-profile/user-edit-profile.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { UserCompletedTasksComponent } from './components/user-completed-tasks/user-completed-tasks.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { EmailWelcomeComponent } from './components/email-welcome/email-welcome.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { TermsConditionComponent } from './components/terms-condition/terms-condition.component';
import { ResetPasswordLinkExpiredComponent } from './components/reset-password-link-expired/reset-password-link-expired.component';
import { TwitchComponent } from './components/twitch/twitch.component';
import { GiftCardsComponent } from './components/gift-cards/gift-cards.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ConfirmMobileVerificationComponent } from '../shared/confirm-mobile-verification/confirm-mobile-verification.component';
import { ShowQuestionsComponent } from './components/show-questions/show-questions.component';
import { MatRadioModule } from '@angular/material/radio';
const routes: Routes = [
  {
    path: 'user/userTasks',
    component: UserTasksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/userRewards/:selectionName',
    component: UserRewardsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/userRewards',
    component: UserRewardsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/termsConditions',
    component: TermsConditionComponent,
  },
  {
    path: 'user/login',
    component: LoginComponent,
  },
  {
    path: 'user/registration',
    component: RegistrationComponent,
  },
  {
    path: 'user/emailconfirmation',
    component: EmailConfirmationComponent,
  },
  {
    path: 'user/emailwelcome',
    component: EmailWelcomeComponent,
  },
  {
    path: 'user/forgotpassword',
    component: ForgotPasswordComponent,
  },
  {
    path: 'user/resetpassword',
    component: ResetPasswordComponent
  },
  {
    path: 'user/linkExpired',
    component: ResetPasswordLinkExpiredComponent,
  },
  {
    path: 'user/changePassword',
    component: ChangePasswordComponent
  },
  {
    path: 'user/userProfile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/editProfile',
    component: UserEditProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/completedTasks',
    component: UserCompletedTasksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/twitch',
    component: TwitchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/giftCards',
    component: GiftCardsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/showQuestions/:campaignId',
    component: ShowQuestionsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [
    UserTasksComponent,
    UserRewardsComponent,
    EmailConfirmationComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserProfileComponent,
    UserEditProfileComponent,
    ChangePasswordComponent,
    UserCompletedTasksComponent,
    EmailWelcomeComponent,
    TermsConditionComponent,
    ResetPasswordLinkExpiredComponent,
    TwitchComponent,
    GiftCardsComponent,
    ConfirmMobileVerificationComponent,
    ShowQuestionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    DatepickerModule,
    SocialLoginModule,
    Ng2FlatpickrModule,
    AngularMultiSelectModule,
    NgOtpInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    RouterModule.forChild(routes),

  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '98590735172-9vkisob1onpthrpagov2s15kjui9efd2.apps.googleusercontent.com',
            )
          },
        ],
        onError: (err) => {
          //console.error('socialProviderError',err);
        }
      } as SocialAuthServiceConfig,
    },
    NgxImageCompressService
  ],
})
export class UserModule { }
