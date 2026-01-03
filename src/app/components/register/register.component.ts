
// src/app/components/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { AppComponent } from '../../app';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'; 
  specialty?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private app = inject(AppComponent);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+88)?[0-9]{11}$/)]],
    role: ['PATIENT' as 'PATIENT' | 'DOCTOR' | 'ADMIN', Validators.required],
    specialty: ['']
  });

  loading = false;
  showPassword = false;

  ngOnInit() {
    this.form.get('role')?.valueChanges.subscribe(role => {
      const specialtyControl = this.form.get('specialty');
      if (role === 'DOCTOR') {
        specialtyControl?.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        specialtyControl?.clearValidators(); 
        specialtyControl?.setValue('');
      }
      specialtyControl?.updateValueAndValidity();
    });
  }

  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.app.showToast('Please fill in all required fields correctly', 'error');
      return;
    }

    this.loading = true;

    const raw = this.form.getRawValue();

    const payload: RegisterPayload = {
      name: raw.name!.trim(),
      email: raw.email!.trim(),
      password: raw.password!.trim(),
      phone: raw.phone!.trim(),
      role: raw.role!,
      specialty: raw.role === 'DOCTOR' ? raw.specialty!.trim() : undefined
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.app.showToast('Account created successfully! Please sign in.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Registration failed. Try again.';
        this.app.showToast(msg, 'error');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}