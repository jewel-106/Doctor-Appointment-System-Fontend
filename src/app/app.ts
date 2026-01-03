// src/app/app.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <!-- Toast Container -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;">
      <div *ngFor="let toast of toastService.toasts()"
           class="toast show align-items-center text-white border-0 shadow-lg"
           [class.bg-success]="toast.type==='success'"
           [class.bg-danger]="toast.type==='error'"
           [class.bg-info]="toast.type==='info'"
           role="alert">
        <div class="d-flex">
          <div class="toast-body fw-medium">
            <i class="bi me-2" 
               [class.bi-check-circle-fill]="toast.type==='success'"
               [class.bi-x-circle-fill]="toast.type==='error'"
               [class.bi-info-circle-fill]="toast.type==='info'"></i>
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  (click)="toastService.remove(toast.id)"></button>
        </div>
      </div>
    </div>

    <!-- Layout for Logged In Users -->
    <div *ngIf="auth.isLoggedIn()" class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed()">

      <!-- Sidebar -->
      <aside class="app-sidebar bg-white border-end">
        <div class="sidebar-header border-bottom d-flex align-items-center justify-content-center">
          <div class="brand-logo bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm">
            BD
          </div>
          <div class="brand-text ms-3 fw-bold text-primary">
            Healthcare
          </div>
        </div>

        <nav class="sidebar-nav flex-grow-1 overflow-auto py-4 px-3">
          <ul class="nav flex-column gap-2">
            
            <!-- Patient Dashboard -->
            <li class="nav-item" *ngIf="auth.hasRole('PATIENT')">
              <a routerLink="/patient/dashboard" routerLinkActive="active"
                 class="nav-link d-flex align-items-center" title="Dashboard">
                <i class="bi bi-speedometer2 fs-5"></i>
                <span class="ms-3">Dashboard</span>
              </a>
            </li>
            
            <!-- Appointments Link (for Patient only) -->
            <li class="nav-item" *ngIf="auth.hasRole('PATIENT')">
              <a routerLink="/appointments" routerLinkActive="active"
                 class="nav-link d-flex align-items-center" title="Appointments">
                <i class="bi bi-calendar-check-fill fs-5"></i>
                <span class="ms-3">Appointments</span>
              </a>
            </li>


            <!-- Patient: New Appointment -->
            <li class="nav-item" *ngIf="auth.hasRole('PATIENT')">
              <a routerLink="/new" routerLinkActive="active"
                 class="nav-link d-flex align-items-center" title="New Appointment">
                <i class="bi bi-plus-circle-fill fs-5"></i>
                <span class="ms-3">New Appointment</span>
              </a>
            </li>

            <!-- Doctor Links -->
            <ng-container *ngIf="auth.hasRole('DOCTOR')">
              <li class="nav-item">
                <div class="text-muted small fw-bold px-3 mt-3 mb-1 text-uppercase" style="font-size: 0.75rem;">Doctor</div>
              </li>
              <li class="nav-item">
                <a routerLink="/doctor/dashboard" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Dashboard">
                  <i class="bi bi-speedometer2 fs-5"></i>
                  <span class="ms-3">Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/appointments" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Appointments">
                  <i class="bi bi-calendar-check-fill fs-5"></i>
                  <span class="ms-3">Appointments</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/schedule" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="My Schedule">
                  <i class="bi bi-clock-history fs-5"></i>
                  <span class="ms-3">My Schedule</span>
                </a>
              </li>
            </ng-container>

            <!-- Admin Links -->
            <ng-container *ngIf="auth.hasRole('ADMIN') || auth.hasRole('SUPER_ADMIN')">
              <li class="nav-item">
                <div class="text-muted small fw-bold px-3 mt-3 mb-1 text-uppercase" style="font-size: 0.75rem;">Admin</div>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/dashboard" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Dashboard">
                  <i class="bi bi-speedometer2 fs-5"></i>
                  <span class="ms-3">Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/doctors" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Doctors">
                  <i class="bi bi-person-badge fs-5"></i>
                  <span class="ms-3">Doctors</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/appointments" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Appointment List">
                  <i class="bi bi-calendar-week fs-5"></i>
                  <span class="ms-3">Appointment List</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/financial" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Financials">
                  <i class="bi bi-cash-coin fs-5"></i>
                  <span class="ms-3">Financials</span>
                </a>
              </li>
            </ng-container>

            <!-- Super Admin Specific Links -->
            <ng-container *ngIf="auth.hasRole('SUPER_ADMIN')">
              <li class="nav-item">
                <div class="text-muted small fw-bold px-3 mt-3 mb-1 text-uppercase" style="font-size: 0.75rem;">System</div>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/hospitals" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Hospitals">
                  <i class="bi bi-hospital fs-5"></i>
                  <span class="ms-3">Hospitals</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/users" routerLinkActive="active"
                   class="nav-link d-flex align-items-center" title="Admins & Users">
                  <i class="bi bi-people-fill fs-5"></i>
                  <span class="ms-3">Admins & Users</span>
                </a>
              </li>
            </ng-container>

            <!-- Profile (Bottom) -->
            <li class="nav-item mt-auto pt-4 border-top">
              <a routerLink="/profile" routerLinkActive="active"
                 class="nav-link d-flex align-items-center" title="My Profile">
                <i class="bi bi-person-circle fs-5"></i>
                <span class="ms-3">My Profile</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Wrapper -->
      <div class="app-main bg-light">

        <!-- Top Header -->
        <header class="app-header bg-white border-bottom px-4 py-3 d-flex align-items-center shadow-sm">
          <button class="btn btn-light border-0 rounded-circle p-2 me-3 text-primary" (click)="toggleSidebar()">
            <i class="bi fs-4" 
               [class.bi-list]="sidebarCollapsed()" 
               [class.bi-text-indent-right]="!sidebarCollapsed()"></i>
          </button>

          <h5 class="m-0 fw-bold text-primary d-none d-md-block">Doctor Appointment System</h5>

          <div class="ms-auto d-flex align-items-center gap-3">
            <div class="dropdown">
              <button class="btn btn-light border rounded-pill py-1 px-2 d-flex align-items-center gap-2 shadow-sm"
                      type="button" data-bs-toggle="dropdown">
                <img [src]="auth.getUser()?.avatar || 'https://via.placeholder.com/40'"
                     class="rounded-circle border" width="32" height="32" alt="User">
                <div class="text-start d-none d-sm-block lh-1 me-1">
                  <div class="fw-bold small text-dark">{{ auth.getUser()?.name }}</div>
                  <div class="text-muted" style="font-size: 0.75rem;">{{ auth.getUser()?.role }}</div>
                </div>
                <i class="bi bi-chevron-down small text-muted"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2 rounded-3">
                <li>
                  <div class="d-flex align-items-center p-3 border-bottom mb-2">
                    <img [src]="auth.getUser()?.avatar || 'https://via.placeholder.com/60'"
                         class="rounded-circle me-3" width="48" height="48">
                    <div>
                      <div class="fw-bold text-dark">{{ auth.getUser()?.name }}</div>
                      <div class="text-muted small">{{ auth.getUser()?.email }}</div>
                    </div>
                  </div>
                </li>
                <li><a class="dropdown-item rounded-2 py-2" routerLink="/profile"><i class="bi bi-person me-2"></i> Profile</a></li>
                <li><a class="dropdown-item rounded-2 py-2" href="#"><i class="bi bi-gear me-2"></i> Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item rounded-2 py-2 text-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i> Logout</button></li>
              </ul>
            </div>
          </div>
        </header>

       
        <main class="p-4">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="bg-white border-top py-3 px-4 text-center text-muted small">
          <div class="row align-items-center">
            <div class="col-md-6 text-md-start">
              &copy; {{ currentYear }} <strong>Online Sheba Healthcare</strong>. All rights reserved.
            </div>
            <div class="col-md-6 text-md-end">
              Powered by <span class="text-primary fw-bold">ME</span>
            </div>
          </div>
        </footer>

      </div>

      
      <div class="sidebar-overlay" [class.show]="!sidebarCollapsed() && isMobile" (click)="toggleSidebar()"></div>
    </div>

   
    <div *ngIf="!auth.isLoggedIn()" class="auth-layout min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div class="w-100" style="max-width: 500px;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }

    .app-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    .app-sidebar {
      width: 280px;
      min-width: 280px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1040;
      position: relative;
      flex-shrink: 0;
    }

    .sidebar-header {
      height: 70px;
      min-height: 70px;
      flex-shrink: 0;
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      font-size: 1.2rem;
    }

    .brand-text {
      font-size: 1.25rem;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.2s;
    }

    .nav-link {
      color: var(--text-secondary);
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-link:hover {
      background-color: var(--bg-body);
      color: var(--primary-color);
    }

    .nav-link.active {
      background-color: var(--primary-light);
      color: var(--primary-color);
      font-weight: 600;
    }

    .sidebar-collapsed .app-sidebar {
      width: 80px;
      min-width: 80px;
    }

    .sidebar-collapsed .brand-text,
    .sidebar-collapsed .nav-link span {
      opacity: 0;
      width: 0;
      display: none;
    }

    .sidebar-collapsed .nav-link {
      justify-content: center;
      padding: 0.875rem 0;
    }

    .sidebar-collapsed .sidebar-header {
      justify-content: center;
    }

    .app-main {
      flex: 1;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .app-header {
      height: 70px;
      min-height: 70px;
      flex-shrink: 0;
      z-index: 1030;
    }

    main {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    footer {
      flex-shrink: 0;
    }

    @media (max-width: 991.98px) {
      .app-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(0);
        box-shadow: var(--shadow-lg);
      }

      .sidebar-collapsed .app-sidebar {
        transform: translateX(-100%);
        width: 280px;
      }

      .sidebar-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1030;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }

      .sidebar-overlay.show {
        opacity: 1;
        pointer-events: auto;
      }
    }

    /* Custom Toast Styles */
    .toast {
      backdrop-filter: blur(10px);
      border-radius: 12px;
      font-size: 0.95rem;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      overflow: hidden;
      min-width: 300px;
    }
    
    .toast.bg-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    }

    .toast.bg-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    }
    
    .toast.bg-info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
    }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  toastService = inject(ToastService);
  sidebarCollapsed = signal(false);
  currentYear = new Date().getFullYear();
  isMobile = window.innerWidth < 992;

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 992;
    this.sidebarCollapsed.set(this.isMobile);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastService.show(message, type);
  }

  logout() {
    this.auth.logout();
  }
}