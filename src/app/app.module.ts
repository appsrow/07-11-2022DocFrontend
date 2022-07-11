import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LandingPageComponent } from './landing-page/landing-page.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';

import { AccessTokenInterceptor } from './shared/services/accessToken.interceptor';
import { AuthService } from './shared/services/auth.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerModule } from 'ng2-datepicker';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { RoleSelectionComponent } from './shared/role-selection/role-selection.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { EmailExipredComponent } from './shared/email-exipred/email-exipred.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { CommonModule, DatePipe } from '@angular/common'
import { FooterComponent } from './shared/footer/footer.component';
import { PoliciesComponent } from './shared/policies/policies.component';
import { PoliciesEsComponent } from './shared/policies-es/policies-es.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
//import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: "./assets/translate/includes/header/", suffix: ".json" },
    { prefix: "./assets/translate/landing-page/", suffix: ".json" },
    { prefix: "./assets/translate/shared/", suffix: ".json" },
    { prefix: "./assets/translate/brand/", suffix: ".json" },
    { prefix: "./assets/translate/user/", suffix: ".json" },
    { prefix: "./assets/translate/admin/", suffix: ".json" },
    { prefix: "./assets/translate/toast-messages/", suffix: ".json" },
  ]);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    RoleSelectionComponent,
    EmailExipredComponent,
    PoliciesComponent,
    PoliciesEsComponent,
    HowItWorksComponent
  ],
  imports: [
    NgxChartsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      timeOut: 4500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }), // ToastrModule added
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DataTablesModule,
    DatepickerModule,
    NgxSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxCaptchaModule,
    //  NgcCookieConsentModule.forRoot(cookieConfig),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AuthService, DatePipe, { provide: HTTP_INTERCEPTORS, useClass: AccessTokenInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule {

}
