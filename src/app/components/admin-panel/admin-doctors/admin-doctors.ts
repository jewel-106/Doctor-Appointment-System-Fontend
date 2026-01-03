import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AppComponent } from '../../../app';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-doctors.html'
})
export class AdminDoctors implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private app = inject(AppComponent);

  doctors: any[] = [];
  showAddDoctor = false;
  loading = false;
  error = '';

  doctorForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    specialty: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    consultationFee: [''],
    qualifications: ['']
  });

  searchTerm = '';
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  specialties = [
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Orthopedic',
    'Gynecologist',
    'Psychiatrist',
    'General Physician',
    'ENT Specialist',
    'Ophthalmologist',
    'Urologist',
    'Gastroenterologist',
    'Pulmonologist',
    'Endocrinologist',
    'Nephrologist',
    'Oncologist',
    'Radiologist',
    'Anesthesiologist',
    'Pathologist',
    'Dentist'
  ];

  onPageSizeChange() {
    this.page = 1;
  }

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.auth.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.loading = false;
      },
      error: () => {
        this.app.showToast('Failed to load doctors', 'error');
        this.loading = false;
      }
    });
  }

  get filteredDoctors() {
    return this.doctors.filter(d =>
      d.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      d.specialty.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedDoctors() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredDoctors.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Array(Math.ceil(this.filteredDoctors.length / this.pageSize)).fill(0).map((x, i) => i + 1);
  }

  isEdit = false;
  editingId: number | null = null;

  addDoctor() {
    if (this.doctorForm.invalid) return;
    this.loading = true;
    this.error = '';
    const data = this.doctorForm.getRawValue();

    if (this.isEdit && this.editingId) {
      const payload = {
        name: data.name!,
        email: data.email!,
        phone: data.phone!,
        specialty: data.specialty!,
        consultationFee: data.consultationFee || null,
        qualifications: data.qualifications || null
      };
      this.auth.updateDoctor(this.editingId, payload).subscribe({
        next: () => {
          this.app.showToast('Doctor updated successfully!', 'success');
          this.resetForm();
          this.loadDoctors();
        },
        error: (err) => {
          const msg = err.error?.error || 'Failed to update doctor';
          this.app.showToast(msg, 'error');
        }
      }).add(() => this.loading = false);
    } else {
      const payload = {
        name: data.name!,
        email: data.email!,
        password: data.password!,
        role: 'DOCTOR' as const,
        phone: data.phone!,
        specialty: data.specialty!
      };
      this.auth.addDoctor(payload).subscribe({
        next: () => {
          this.app.showToast('Doctor added successfully!', 'success');
          this.resetForm();
          this.loadDoctors();
        },
        error: (err) => {
          const msg = err.error?.error || 'Failed to add doctor';
          this.app.showToast(msg, 'error');
        }
      }).add(() => this.loading = false);
    }
  }

  editDoctor(doctor: any) {
    this.isEdit = true;
    this.editingId = doctor.id;
    this.showAddDoctor = true;
    this.doctorForm.patchValue({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      consultationFee: doctor.consultationFee || '',
      qualifications: doctor.qualifications || '',
      password: ''
    });
    this.doctorForm.get('password')?.clearValidators();
    this.doctorForm.get('password')?.updateValueAndValidity();
  }

  resetForm() {
    this.showAddDoctor = false;
    this.isEdit = false;
    this.editingId = null;
    this.doctorForm.reset();
    this.doctorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.doctorForm.get('password')?.updateValueAndValidity();
  }

  selectedDoctor: any = null;
  showViewModal: boolean = false;

  toggleStatus(doctor: any) {
    const newStatus = !doctor.active;
    this.auth.updateDoctorStatus(doctor.id, newStatus).subscribe({
      next: () => {
        doctor.active = newStatus;
        this.app.showToast(`Doctor status updated to ${newStatus ? 'Active' : 'Inactive'}`, 'success');
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.app.showToast('Failed to update status', 'error');
      }
    });
  }

  viewDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedDoctor = null;
  }
}