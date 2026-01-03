import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppComponent } from '../../app';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private app = inject(AppComponent);
  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  loading = false;
  submitted = false;
  showPassword = false;
  currentYear = new Date().getFullYear();
  get f() { return this.form.controls; }
  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.app.showToast('Please fill in all fields correctly', 'error');
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login({ email: email!.trim(), password: password!.trim() }).subscribe({
      next: () => {
        this.app.showToast('Welcome back!', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err.error?.message || err.error?.error || 'Invalid email or password';
        this.app.showToast(msg, 'error');
        this.loading = false;
      }
    });
  }
}