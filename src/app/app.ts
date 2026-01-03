import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from './services/toast.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  auth = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);
  sidebarCollapsed = signal(false);
  currentYear = new Date().getFullYear();
  isMobile = window.innerWidth < 992;
  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }
  isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register') || url === '/' || url.includes('/forgot-password') || url.includes('/reset-password') || url.includes('/verify-otp');
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