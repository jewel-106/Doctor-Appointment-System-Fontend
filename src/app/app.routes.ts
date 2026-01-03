import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { DoctorScheduleComponent } from './components/doctor-schedule/doctor-schedule.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      if (auth.isLoggedIn()) {
        const user = auth.getUser();
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return '/admin/dashboard';
        if (user?.role === 'DOCTOR') return '/doctor/dashboard';
        if (user?.role === 'PATIENT') return '/patient/dashboard';
        return '/appointments';
      }
      return '/login';
    }
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'appointments', component: AppointmentListComponent },
      {
        path: 'view/:id',
        loadComponent: () => import('./components/appointment-details/appointment-details.component').then(m => m.AppointmentDetailsComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./components/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent),
        canActivate: [roleGuard(['PATIENT'])]
      },
      { path: 'edit/:id', component: AppointmentFormComponent, canActivate: [roleGuard(['ADMIN', 'PATIENT', 'DOCTOR'])] },
      {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', loadComponent: () => import('./components/admin-panel/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
          { path: 'doctors', loadComponent: () => import('./components/admin-panel/admin-doctors/admin-doctors').then(m => m.AdminDoctors) },
          { path: 'financial', loadComponent: () => import('./components/admin-panel/admin-financial/admin-financial').then(m => m.AdminFinancial) },
          { path: 'hospitals', loadComponent: () => import('./components/admin-panel/admin-hospitals/admin-hospitals.component').then(m => m.AdminHospitalsComponent) },
          { path: 'users', loadComponent: () => import('./components/admin-panel/admin-users/admin-users.component').then(m => m.AdminUsersComponent) },
          { path: 'appointments', component: AppointmentListComponent }
        ]
      },
      { path: 'schedule', component: DoctorScheduleComponent, canActivate: [roleGuard(['DOCTOR'])] },
      {
        path: 'doctor/dashboard',
        loadComponent: () => import('./components/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent),
        canActivate: [roleGuard(['DOCTOR'])]
      },
      {
        path: 'patient/dashboard',
        loadComponent: () => import('./components/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent),
        canActivate: [roleGuard(['PATIENT'])]
      },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'appointments', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];