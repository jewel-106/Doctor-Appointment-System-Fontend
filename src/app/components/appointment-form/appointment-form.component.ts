import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';
import { AuthService } from '../../services/auth.service';
import { AppComponent } from '../../app';

@Component({
    selector: 'app-appointment-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './appointment-form.component.html',
    styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(AppointmentService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private auth = inject(AuthService);
    private app = inject(AppComponent);

    form = this.fb.group({
        patientName: ['', [Validators.required, Validators.minLength(2)]],
        patientEmail: ['', [Validators.required, Validators.email]],
        patientPhone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{10,15}$/)]],
        patientAge: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        patientGender: ['', Validators.required],
        emergencyContact: [''],
        doctorId: [null as number | null, Validators.required],
        appointmentDate: ['', Validators.required],
        appointmentTime: ['', Validators.required],
        status: ['pending' as 'pending' | 'confirmed' | 'cancelled' | 'complete'],
        notes: [''],
        reason: ['']
    });
    isEdit = false;
    id!: number;
    doctors: any[] = [];
    loading = false;
    isPatient = false;
    isAdmin = false;
    isDoctor = false;
    error = '';

    get today(): string {
        return new Date().toISOString().split('T')[0];
    }
    get activeDoctors() {
        return this.doctors.filter(d => d.active !== false);
    }

    ngOnInit(): void {
        const user = this.auth.getUser();
        this.isPatient = user?.role === 'PATIENT';
        this.isAdmin = user?.role === 'ADMIN';
        this.isDoctor = user?.role === 'DOCTOR';
        this.loadDoctors();

        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.id = +idParam;
            this.service.getAppointment(this.id).subscribe({
                next: (apt) => {
                    this.form.patchValue({
                        patientName: apt.patientName,
                        patientEmail: apt.patientEmail,
                        patientPhone: apt.patientPhone || '',
                        patientAge: apt.patientAge || '',
                        patientGender: apt.patientGender || '',
                        emergencyContact: apt.emergencyContact || '',
                        doctorId: apt.doctorId,
                        appointmentDate: apt.appointmentDate,
                        appointmentTime: (apt.appointmentTime || '').slice(0, 5),
                        status: apt.status,
                        notes: apt.notes || '',
                        reason: apt.reason || ''
                    });

                    if (this.isPatient) {
                        this.form.get('patientEmail')?.disable();
                        this.form.get('status')?.disable();
                        this.form.get('doctorId')?.disable();
                        this.form.get('appointmentDate')?.disable();
                        this.form.get('appointmentTime')?.disable();
                        this.form.get('notes')?.disable();
                    } else if (this.isAdmin || this.isDoctor) {
                        this.form.get('patientName')?.disable();
                        this.form.get('patientEmail')?.disable();
                        this.form.get('patientPhone')?.disable();
                        this.form.get('patientAge')?.disable();
                        this.form.get('patientGender')?.disable();
                        this.form.get('emergencyContact')?.disable();
                        if (this.isDoctor) {
                            this.form.get('doctorId')?.disable();
                        }
                    }
                },
                error: () => {
                    this.app.showToast('Appointment not found', 'error');
                    this.router.navigate(['/appointments']);
                }
            });
        } else {
            if (this.isPatient && user) {
                this.form.patchValue({
                    patientName: user.name,
                    patientEmail: user.email,
                    patientPhone: user.phone || '',
                    status: 'pending'
                });
                this.form.get('patientEmail')?.disable();
                this.form.get('status')?.disable();
            }
        }
    }

    loadDoctors() {
        this.loading = true;
        this.service.getDoctors().subscribe({
            next: (data) => {
                this.doctors = data.map(d => ({ ...d, active: d.hasOwnProperty('active') ? d.active : true }));
                this.loading = false;
            },
            error: () => {
                this.error = 'Failed to load doctors';
                this.loading = false;
                this.app.showToast('Failed to load doctors list', 'error');
            }
        });
    }

    submit(): void {
        if (this.form.invalid || this.loading) return;
        this.loading = true;

        const raw = this.form.getRawValue();
        const appointment: Appointment = {
            patientName: raw.patientName!,
            patientEmail: raw.patientEmail!,
            patientPhone: raw.patientPhone!,
            patientAge: raw.patientAge!,
            patientGender: raw.patientGender!,
            emergencyContact: raw.emergencyContact || undefined,
            doctorId: raw.doctorId!,
            appointmentDate: raw.appointmentDate!,
            appointmentTime: raw.appointmentTime! + ':00',
            status: raw.status!,
            notes: raw.notes || undefined,
            reason: raw.reason || undefined
        };

        const action = this.isEdit
            ? this.service.updateAppointment(this.id, appointment)
            : this.service.createAppointment(appointment);

        action.subscribe({
            next: () => {
                this.app.showToast(this.isEdit ? 'Appointment updated successfully!' : 'Appointment created successfully!', 'success');
                this.router.navigate(['/appointments']);
            },
            error: (err) => {
                console.error('Appointment save error:', err);
                const msg = err.error?.error || 'Failed to save appointment. Please try again.';
                this.app.showToast(msg, 'error');
                this.loading = false;
            },
            complete: () => this.loading = false
        });
    }

    cancel() {
        this.router.navigate(['/appointments']);
    }
}