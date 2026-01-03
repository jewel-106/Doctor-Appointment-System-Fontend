import { Component, inject, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss']

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