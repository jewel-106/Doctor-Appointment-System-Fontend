
// src/app/auth/reset-password/reset-password.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="max-width: 450px; width: 100%;">
        <div class="card-header bg-success text-white text-center py-4 border-0">
          <i class="bi bi-lock-fill display-4"></i>
          <h4 class="fw-bold mt-2 mb-0">Set New Password</h4>
        </div>
        <div class="card-body p-5">
          <p class="text-muted text-center mb-4">
            Please create a strong password for your account.
          </p>

          <form (ngSubmit)="reset()" #resetForm="ngForm">
           
            <div class="form-floating mb-3">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                class="form-control rounded-3" 
                id="newPass" 
                placeholder="New Password"
                [(ngModel)]="pass1" 
                name="p1" 
                required 
                minlength="6"
                #p1Ctrl="ngModel"
                [class.is-invalid]="p1Ctrl.invalid && (p1Ctrl.dirty || p1Ctrl.touched)">
              <label for="newPass" class="text-muted">
                <i class="bi bi-key me-2"></i>New Password
              </label>
              <button type="button" class="btn position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent" 
                      (click)="showPassword = !showPassword" tabindex="-1">
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
              <div class="invalid-feedback text-start ps-2">
                Password must be at least 6 characters.
              </div>
            </div>

    
            <div class="form-floating mb-4">
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                class="form-control rounded-3" 
                id="confirmPass" 
                placeholder="Confirm Password"
                [(ngModel)]="pass2" 
                name="p2" 
                required 
                [pattern]="pass1"
                #p2Ctrl="ngModel"
                [class.is-invalid]="(p2Ctrl.dirty || p2Ctrl.touched) && pass1 !== pass2">
              <label for="confirmPass" class="text-muted">
                <i class="bi bi-check-circle me-2"></i>Confirm Password
              </label>
              <button type="button" class="btn position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent" 
                      (click)="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                <i class="bi" [class.bi-eye]="!showConfirmPassword" [class.bi-eye-slash]="showConfirmPassword"></i>
              </button>
              <div class="invalid-feedback text-start ps-2" *ngIf="pass1 !== pass2">
                Passwords do not match.
              </div>
            </div>

            <button 
              type="submit" 
              class="btn btn-success btn-lg w-100 rounded-pill shadow-sm fw-bold mb-4 transition-all"
              [disabled]="resetForm.invalid || pass1 !== pass2 || loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Updating Password...' : 'Reset Password' }}
            </button>
          </form>

          <div class="text-center">
            <a routerLink="/login" class="text-decoration-none text-secondary fw-semibold d-inline-flex align-items-center hover-link">
              <i class="bi bi-arrow-left me-2"></i> Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transition-all {
      transition: all 0.3s ease;
    }
    .btn-success {
      background: linear-gradient(45deg, #198754, #20c997);
      border: none;
    }
    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3) !important;
    }
    .hover-link:hover {
      color: #198754 !important;
    }
    .form-control:focus {
      border-color: #198754;
      box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
    }
    .form-floating > label {
      padding-left: 1.25rem;
    }
    .form-floating > .form-control {
      padding-left: 1.25rem;
    }

    .form-floating .btn.position-absolute {
      z-index: 4;
      color: #6c757d;
    }
    .form-floating .btn.position-absolute:hover {
      color: #198754;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  pass1 = '';
  pass2 = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.email = localStorage.getItem('resetEmail') || '';
    if (!this.email) {
      alert('Invalid access! Please start again.');
      this.router.navigate(['/forgot-password']);
    }
  }

  reset() {
    if (this.pass1 !== this.pass2 || this.pass1.length < 6) return;

    this.loading = true;
    this.auth.resetPassword(this.email, this.pass1).subscribe({
      next: () => {
        localStorage.removeItem('resetEmail');
        alert('Password changed successfully! You can now login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to reset password. Please try again.');
        this.loading = false;
      }
    });
  }
}