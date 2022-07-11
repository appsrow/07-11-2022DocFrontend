import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminModule } from './admin/admin.module';
import { BrandModule } from './brand/brand.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { EmailExipredComponent } from './shared/email-exipred/email-exipred.component';
import { PoliciesComponent } from './shared/policies/policies.component';
import { PoliciesEsComponent } from './shared/policies-es/policies-es.component';
import { RoleSelectionComponent } from './shared/role-selection/role-selection.component';
import { UserModule } from './user/user.module';
import { PublicModule } from './public/public.module';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'home', component: LandingPageComponent },
  { path: 'howItWorks', component: HowItWorksComponent },
  { path: 'roleSelection', component: RoleSelectionComponent },
  { path: 'emailExpired', component: EmailExipredComponent },
  { path: 'policies', component: PoliciesComponent },
  { path: 'policies-es', component: PoliciesEsComponent },
  {
    path: 'brand',
    loadChildren: () => import('./brand/brand.module').then(m => m.BrandModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: 'public',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
  },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' }),
    UserModule,
    BrandModule,
    AdminModule,
    PublicModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
