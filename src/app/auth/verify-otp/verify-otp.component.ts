import { Component, inject, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="max-width: 480px; width: 100%;">
        <div class="card-header bg-success text-white text-center py-4 border-0">
          <i class="bi bi-shield-check display-4"></i>
          <h4 class="fw-bold mt-2 mb-0">Verify Your Identity</h4>
        </div>
        <div class="card-body p-5 text-center">
          <p class="text-muted mb-4">
            We've sent a 6-digit verification code to<br>
            <strong class="text-dark">{{ email || 'your email' }}</strong>
          </p>

          <div class="d-flex justify-content-center gap-2 mb-4">
            <input *ngFor="let digit of otp; let i = index; trackBy: trackByIndex"
                   #otpInput
                   type="text" 
                   inputmode="numeric" 
                   maxlength="1"
                   class="form-control text-center fs-2 fw-bold otp-input"
                   [value]="digit"
                   (input)="onInput(i, $event)" 
                   (keydown)="onKeyDown(i, $event)"
                   (paste)="onPaste($event)"
                   [class.filled]="digit"
                   autocomplete="one-time-code">
          </div>

          <button 
            class="btn btn-success btn-lg w-100 rounded-pill shadow-sm fw-bold mb-4 transition-all"
            (click)="verify()"
            [disabled]="!isOtpComplete || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Verifying...' : 'Verify & Proceed' }}
          </button>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <button 
              class="btn btn-link text-decoration-none text-secondary p-0 d-flex align-items-center hover-link" 
              (click)="resend()" 
              [disabled]="loading">
              <i class="bi bi-arrow-clockwise me-1"></i> Resend Code
            </button>
            
            <a routerLink="/login" class="text-decoration-none text-secondary fw-semibold d-flex align-items-center hover-link">
              <i class="bi bi-arrow-left me-1"></i> Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .otp-input {
      width: 50px;
      height: 60px;
      border-radius: 12px;
      border: 2px solid #dee2e6;
      transition: all 0.2s ease;
      background-color: #f8f9fa;
      caret-color: #198754;
    }
    .otp-input:focus {
      border-color: #198754;
      box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1);
      background-color: #fff;
      transform: translateY(-2px);
    }
    .otp-input.filled {
      border-color: #198754;
      background-color: #fff;
    }
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
  `]
})
export class VerifyOtpComponent implements OnInit, AfterViewInit {
  email = '';
  otp: string[] = ['', '', '', '', '', ''];
  loading = false;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.email = localStorage.getItem('resetEmail') || '';
    if (!this.email) {
      alert('Session expired! Please request OTP again.');
      this.router.navigate(['/forgot-password']);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.otpInputs.first?.nativeElement.focus(), 100);
  }

  trackByIndex(index: number): number {
    return index;
  }

  get isOtpComplete(): boolean {
    return this.otp.every(digit => digit && digit.trim() !== '');
  }

  onInput(index: number, event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.otp[index] = '';
      return;
    }

    if (value.length > 1) {
      value = value.slice(-1);
      input.value = value;
    }

    this.otp[index] = value;

    if (value && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      if (!this.otp[index] && index > 0) {
        this.otpInputs.toArray()[index - 1].nativeElement.focus();
      } else {
        this.otp[index] = ''; 
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    const numbers = clipboardData.replace(/\D/g, '').split('').slice(0, 6);

    if (numbers.length > 0) {
      numbers.forEach((num, i) => {
        if (i < 6) this.otp[i] = num;
      });

      const nextIndex = Math.min(numbers.length, 5);
      this.otpInputs.toArray()[nextIndex].nativeElement.focus();
    }
  }

  verify() {
    const code = this.otp.join('');
    if (code.length !== 6) return;

    this.loading = true;
    this.auth.verifyResetOtp(this.email, code).subscribe({
      next: () => {
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        alert('Invalid or expired OTP. Please try again.');
        this.loading = false;
        this.otp = ['', '', '', '', '', ''];
        this.otpInputs.first?.nativeElement.focus();
      }
    });
  }

  resend() {
    this.loading = true;
    this.auth.resendOtp(this.email).subscribe({
      next: () => {
        alert('OTP resent successfully!');
        this.loading = false;
        this.otp = ['', '', '', '', '', ''];
        this.otpInputs.first?.nativeElement.focus();
      },
      error: () => {
        alert('Failed to resend OTP. Please try again later.');
        this.loading = false;
      }
    });
  }
}