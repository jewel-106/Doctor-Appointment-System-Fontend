import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']

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