import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateCampaignComponent } from './components/create-campaign/create-campaign.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { DatepickerModule } from 'ng2-datepicker';
import { NgxCaptchaModule } from 'ngx-captcha';
import { BrandEditProfileComponent } from './components/brand-edit-profile/brand-edit-profile.component';
import { DataTablesModule } from 'angular-datatables';
import { AuthGuard } from '../shared/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CampaignTargetComponent } from './components/campaign-target/campaign-target.component';
import { BrandProfileComponent } from './components/brand-profile/brand-profile.component';
import { BrandMyWalletComponent } from './components/brand-my-wallet/brand-my-wallet.component';
import { MyCampaignComponent } from './components/my-campaign/my-campaign.component';
import { CampaignPreviewComponent } from './components/campaign-preview/campaign-preview.component';
import { SuccessPaymentComponent } from './components/success-payment/success-payment.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CampaignStatisticsComponent } from './components/campaign-statistics/campaign-statistics.component';
import { BillingHistoryComponent } from './components/billing-history/billing-history.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { LeadCampaignlistComponent } from './components/lead-campaignlist/lead-campaignlist.component';
import { LeadUserslistComponent } from './components/lead-userslist/lead-userslist.component';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { SearchPipe } from '../shared/pipes/search.pipe';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { EmailWelcomeComponent } from './components/email-welcome/email-welcome.component';
//import { GoogleApiComponent } from './components/google-api/google-api.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CampaignCreateTabsComponent } from './components/campaign-create-tabs/campaign-create-tabs.component';
import { ResetPasswordLinkExpiredComponent } from './components/reset-password-link-expired/reset-password-link-expired.component';
import { QuestionsFormComponent } from './components/questions-form/questions-form.component';
import { BrowserModule } from '@angular/platform-browser';
// import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatPseudoCheckboxModule, MatRippleModule } from '@angular/material/core';

import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { ObserversModule } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { PortalModule } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { FormCampaignDataComponent } from './components/form-campaign-data/form-campaign-data.component';
import { QuestionAnswersComponent } from './components/question-answers/question-answers.component';



const routes: Routes = [
  {
    path: 'brand/login',
    component: LoginComponent,
  },
  {
    path: 'brand/registration',
    component: RegistrationComponent,
  },
  {
    path: 'brand/emailconfirmation',
    component: EmailConfirmationComponent,
  },
  {
    path: 'brand/emailwelcome',
    component: EmailWelcomeComponent,
  },
  {
    path: 'brand/forgotpassword',
    component: ForgotPasswordComponent,
  },
  {
    path: 'brand/resetpassword',
    component: ResetPasswordComponent,
  },
  {
    path: 'brand/linkExpired',
    component: ResetPasswordLinkExpiredComponent,
  },
  {
    path: 'brand/changePassword',
    component: ChangePasswordComponent
  },
  {
    path: 'brand/billingHistory',
    component: BillingHistoryComponent,
  },
  {
    path: 'brand/createCampaign',
    component: CreateCampaignComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/campaignTarget',
    component: CampaignCreateTabsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/profile',
    component: BrandProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/editProfile',
    component: BrandEditProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/myWallet',
    component: BrandMyWalletComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/myCampaign',
    component: MyCampaignComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/previewCampaign',
    component: MyCampaignComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/paymentSuccess',
    component: SuccessPaymentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/statistics',
    component: CampaignStatisticsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/my-wallet',
    component: BrandMyWalletComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'brand/lead-campaigns',
    component: LeadCampaignlistComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brand/lead-users',
    component: LeadUserslistComponent,
  },
  {
    path: 'brand/createCampaignTabs',
    component: CampaignCreateTabsComponent,
  },
  {
    path: 'brand/questionsForm',
    component: QuestionsFormComponent
  },
  {
    path: 'brand/formCampaignUsers',
    component: FormCampaignDataComponent
  },
  {
    path: 'brand/questionAnswers',
    component: QuestionAnswersComponent
  }
]

@NgModule({
  declarations: [
    CreateCampaignComponent,
    CampaignTargetComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    EmailConfirmationComponent,
    BrandProfileComponent,
    BrandEditProfileComponent,
    BrandMyWalletComponent,
    MyCampaignComponent,
    CampaignPreviewComponent,
    SuccessPaymentComponent,
    CampaignStatisticsComponent,
    BillingHistoryComponent,
    LeadCampaignlistComponent,
    LeadUserslistComponent,
    ChangePasswordComponent,
    SearchPipe,
    EmailWelcomeComponent,
    CampaignCreateTabsComponent,
    ResetPasswordLinkExpiredComponent,
    QuestionsFormComponent,
    FormCampaignDataComponent,
    QuestionAnswersComponent,
    // GoogleApiComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    DatepickerModule,
    NgxCaptchaModule,
    DataTablesModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    Ng2FlatpickrModule,
    AngularMultiSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // NgxDaterangepickerMd.forRoot(),
    RouterModule.forChild(routes),
    NgCircleProgressModule.forRoot(),
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    // DateRangePickerModule,
  ],
  exports: [
    CampaignTargetComponent,

    // All jp datepicker imports
    // CDK
    A11yModule,
    BidiModule,
    ObserversModule,
    OverlayModule,
    PlatformModule,
    PortalModule,
    //  ScrollDispatchModule,
    //  CdkStepperModule,
    //  CdkTableModule,

    // Material
    //  MatAutocompleteModule,
    MatButtonModule,
    //  MatButtonToggleModule,
    //  MatCardModule,
    MatPseudoCheckboxModule,
    //  MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    //  MatDividerModule,
    //  MatExpansionModule,
    MatFormFieldModule,
    //  MatGridListModule,
    //  MatIconModule,
    MatInputModule,
    //  MatListModule,
    //  MatMenuModule,
    MatNativeDateModule,
    //  MatPaginatorModule,
    //  MatProgressBarModule,
    //  MatProgressSpinnerModule,
    //  MatRadioModule,
    MatRippleModule,
    //  MatSelectModule,
    //  MatSidenavModule,
    //  MatSliderModule,
    //  MatSlideToggleModule,
    //  MatSnackBarModule,
    //  MatSortModule,
    //  MatStepperModule,
    //  MatTableModule,
    //  MatTabsModule,
    //  MatToolbarModule,
    //  MatTooltipModule,
  ]
})
export class BrandModule { }
