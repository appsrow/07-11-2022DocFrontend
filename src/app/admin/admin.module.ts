import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './components/users/users.component';
import { BrandsComponent } from './components/brands/brands.component';
import { CampaignsComponent } from './components/campaigns/campaigns.component';
import { UsersDetailsComponent } from './components/users-details/users-details.component';
import { BrandsDetailsComponent } from './components/brands-details/brands-details.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { CampaignStatisticsComponent } from './components/campaign-statistics/campaign-statistics.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import {ConfirmDialogComponent} from './confirm-dialog.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DatepickerModule } from 'ng2-datepicker';
import { GiftCardDetailsComponent } from './components/gift-card-details/gift-card-details.component';
import { InternalDashboardComponent } from './components/internal-dashboard/internal-dashboard.component';
const routes: Routes = [
  {
    path: 'admin/login', 
    component: LoginComponent,
  },
  {
    path: 'admin/users', 
    component: UsersComponent,
  },
  {
    path: 'admin/user-details/:id', 
    component: UsersDetailsComponent,
  },
  {
    path: 'admin/brands', 
    component: BrandsComponent,
  },
  {
    path: 'admin/brands-details/:id', 
    component: BrandsDetailsComponent,
  },
  {
    path: 'admin/statistics', 
    component: CampaignStatisticsComponent,
  },
  {
    path: 'admin/campaigns', 
    component: CampaignsComponent,
  },
  {
    path: 'admin/invoices', 
    component: InvoicesComponent,
  },
  {
    path: 'admin/dashboard', 
    component: DashboardComponent,
  },
  {
    path: 'admin/reports', 
    component: ReportsComponent,
  },
  {
    path: 'admin/giftCardDetails', 
    component: GiftCardDetailsComponent,
  },
  {
    path: 'admin/internalDashboard', 
    component: InternalDashboardComponent,
  }
]

@NgModule({
  declarations: [
    LoginComponent,
    UsersComponent,
    BrandsComponent,
    CampaignsComponent,
    UsersDetailsComponent,
    BrandsDetailsComponent,
    CampaignStatisticsComponent,
    InvoicesComponent,
    ConfirmDialogComponent,
    DashboardComponent,
    ReportsComponent,
    GiftCardDetailsComponent,
    InternalDashboardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    Ng2FlatpickrModule,
    AngularMultiSelectModule,
    DatepickerModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  }),
  NgCircleProgressModule.forRoot(),
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
