import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { adminGuard, companyGuard, youtuberGuard } from './guards/auth.guard';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { CompanyDashboardComponent } from './pages/company-dashboard/company-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { YoutuberDashboardComponent } from './pages/youtuber-dashboard/youtuber-dashboard.component';
import { YoutuberDetailsComponent } from './pages/youtuber-details/youtuber-details.component';
import { YoutubersComponent } from './pages/youtubers/youtubers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'youtubers', component: YoutubersComponent },
  { path: 'youtuber-details', component: YoutuberDetailsComponent },
  { path: 'company-dashboard', component: CompanyDashboardComponent, canActivate: [companyGuard] },
  { path: 'youtuber-dashboard', component: YoutuberDashboardComponent, canActivate: [youtuberGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'home' }
];
