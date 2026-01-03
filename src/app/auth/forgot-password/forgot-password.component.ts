import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']

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