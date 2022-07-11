import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { MetricsComponent } from './components/metrics/metrics.component';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatepickerModule } from 'ng2-datepicker';
import { NgxCaptchaModule } from 'ngx-captcha';
import { DataTablesModule } from 'angular-datatables';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { AmbassadorsDashboardComponent } from './components/ambassadors-dashboard/ambassadors-dashboard.component';
import { StreamerSubscriptionsComponent } from './components/streamer-subscriptions/streamer-subscriptions.component';


const routes: Routes = [
  {
    path: 'campaign/:campaign_sharing_code',
    component: MetricsComponent
  },
  {
    path: 'ambassador/:streamer_user_name',
    component: AmbassadorsDashboardComponent
  },
  {
    path: 'streamersSubscriptions',
    component: StreamerSubscriptionsComponent
  },
];


@NgModule({
  declarations: [
    MetricsComponent,
    AmbassadorsDashboardComponent,
    StreamerSubscriptionsComponent,

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
  ]
})
export class PublicModule {

}
