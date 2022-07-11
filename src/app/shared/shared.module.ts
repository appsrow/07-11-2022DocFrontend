import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RoleSelectionComponent } from './role-selection/role-selection.component';
import { EmailExipredComponent } from './email-exipred/email-exipred.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { ConfirmMobileVerificationComponent } from './confirm-mobile-verification/confirm-mobile-verification.component';

@NgModule({
  declarations: [
    // HeaderComponent,
    // FooterComponent,
    RoleSelectionComponent,
    EmailExipredComponent,
    ConfirmMobileVerificationComponent,
    
  ],
  imports: [
    CommonModule,
    // TranslateModule.forRoot({
    //   loader: {
    //       provide: TranslateLoader,
    //       useFactory: HttpLoaderFactory,
    //       deps: [HttpClient]
    //   }
    // }),
  ]
})
export class SharedModule { }
