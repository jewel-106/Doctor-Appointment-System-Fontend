import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppComponent } from '../../app';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private app = inject(AppComponent);
  user: any = null;
  previewAvatar = 'https://via.placeholder.com/150';
  showEdit = false;
  editForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    specialty: ''
  };
  showPass = false;
  passForm = { current: '', new: '', confirm: '' };
  loading = false;
  ngOnInit() {
    this.loadUserData();
  }
  loadUserData() {
    this.user = this.auth.getUser();
    if (this.user && !this.user.hasOwnProperty('address')) {
      console.log('Old user data structure detected, please logout and login again');
      this.app.showToast('Please logout and login again to see updated profile', 'error');
    }
    this.previewAvatar = this.user?.avatar || 'https://via.placeholder.com/150';
    this.editForm = {
      name: this.user?.name || '',
      email: this.user?.email || '',
      phone: this.user?.phone || '',
      address: this.user?.address || '',
      bio: this.user?.bio || '',
      gender: this.user?.gender || '',
      dateOfBirth: this.user?.dateOfBirth || '',
      specialty: this.user?.specialty || ''
    };
  }
  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.previewAvatar = base64;
      this.auth.updateAvatar(base64).subscribe({
        next: () => {
          this.auth.updateLocalUser({ avatar: base64 });
          this.loadUserData();
          this.app.showToast('Profile picture updated successfully!', 'success');
        },
        error: () => this.app.showToast('Failed to update picture', 'error')
      });
    };
    reader.readAsDataURL(file);
  }
  onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }
  onDragOver(e: DragEvent) {
    e.preventDefault();
  }
  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.previewAvatar = base64;
      this.auth.updateAvatar(base64).subscribe({
        next: () => {
          this.auth.updateLocalUser({ avatar: base64 });
          this.loadUserData();
          this.app.showToast('Avatar updated!', 'success');
        },
        error: () => this.app.showToast('Upload failed', 'error')
      });
    };
    reader.readAsDataURL(file);
  }
  saveProfile() {
    if (!this.editForm.name || !this.editForm.email) {
      this.app.showToast('Name and Email are required', 'error');
      return;
    }
    this.loading = true;
    this.auth.updateProfile(this.editForm).subscribe({
      next: () => {
        this.loading = false;
        this.showEdit = false;
        this.loadUserData();
        this.app.showToast('Profile updated successfully!', 'success');
      },
      error: () => {
        this.loading = false;
        this.app.showToast('Update failed', 'error');
      }
    });
  }
  changePassword() {
    if (this.passForm.new !== this.passForm.confirm) {
      this.app.showToast('New passwords do not match', 'error');
      return;
    }
    if (this.passForm.new.length < 6) {
      this.app.showToast('Password must be at least 6 characters', 'error');
      return;
    }
    this.loading = true;
    this.auth.changePassword(this.passForm.current.trim(), this.passForm.new.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.showPass = false;
        this.passForm = { current: '', new: '', confirm: '' };
        this.app.showToast('Password changed successfully!', 'success');
      },
      error: () => {
        this.loading = false;
        this.app.showToast('Current password is wrong', 'error');
      }
    });
  }
}