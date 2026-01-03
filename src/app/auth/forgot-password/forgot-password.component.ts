
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="max-width: 450px; width: 100%;">
        <div class="card-header bg-success text-white text-center py-4 border-0">
          <i class="bi bi-shield-lock-fill display-4"></i>
          <h4 class="fw-bold mt-2 mb-0">Forgot Password?</h4>
        </div>
        <div class="card-body p-5">
          <p class="text-muted text-center mb-4">
            Enter your registered email address and we'll send you a One-Time Password (OTP) to reset your password.
          </p>

          <form (ngSubmit)="sendOtp()" #forgotForm="ngForm">
            <div class="form-floating mb-4">
              <input 
                type="email" 
                class="form-control rounded-3" 
                id="emailInput" 
                placeholder="name@example.com"
                [(ngModel)]="email" 
                name="email" 
                required 
                email 
                #emailCtrl="ngModel"
                [class.is-invalid]="emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched)">
              <label for="emailInput" class="text-muted">
                <i class="bi bi-envelope me-2"></i>Email Address
              </label>
              <div class="invalid-feedback text-start ps-2">
                Please enter a valid email address.
              </div>
            </div>

            <button 
              type="submit" 
              class="btn btn-success btn-lg w-100 rounded-pill shadow-sm fw-bold mb-4 transition-all"
              [disabled]="forgotForm.invalid || loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ loading ? 'Sending OTP...' : 'Send Reset Link' }}
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
  `]
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;

  private auth = inject(AuthService);
  private router = inject(Router);

  sendOtp() {
    if (!this.email) return;

    this.loading = true;
    localStorage.setItem('resetEmail', this.email.trim());

    this.auth.sendForgotPasswordOtp(this.email.trim()).subscribe({
      next: () => {
       
        alert('OTP sent successfully! Please check your email.');
        this.router.navigate(['/verify-otp']);
      },
      error: (err) => {
        alert(err.error?.message || 'Email not found or server error.');
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}
