import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService, Division, District, Upazila } from '../../services/location.service';
import { HospitalService, Hospital } from '../../services/hospital.service';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
@Component({
    selector: 'app-book-appointment',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './book-appointment.component.html',
    styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
    private locationService = inject(LocationService);
    private hospitalService = inject(HospitalService);
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    currentStep = 1;
    divisions: Division[] = [];
    districts: District[] = [];
    upazilas: Upazila[] = [];
    hospitals: Hospital[] = [];
    doctors: any[] = [];
    selectedDivisionId: number | null = null;
    selectedDistrictId: number | null = null;
    selectedUpazilaId: number | null = null;
    selectedHospital: Hospital | null = null;
    selectedDoctor: any | null = null;
    availableSlots: any[] = [];
    form = this.fb.group({
        patientName: ['', [Validators.required, Validators.minLength(2)]],
        patientEmail: ['', [Validators.required, Validators.email]],
        patientPhone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{10,15}$/)]],
        patientAge: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        patientGender: ['', Validators.required],
        appointmentDate: ['', Validators.required],
        appointmentTime: ['', Validators.required],
        reason: ['']
    });
    loading = false;
    get today(): string {
        return new Date().toISOString().split('T')[0];
    }
    ngOnInit() {
        this.loadDivisions();
        this.loadSavedPreference();
        const user = this.authService.getUser();
        if (user) {
            this.form.patchValue({
                patientName: user.name,
                patientEmail: user.email,
                patientPhone: user.phone
            });
            this.form.get('patientEmail')?.disable();
        }
        this.form.get('appointmentDate')?.valueChanges.subscribe(date => {
            if (date && this.selectedDoctor) {
                this.loadSlots(date);
            }
        });
    }
    loadDivisions() {
        this.locationService.getDivisions().subscribe(data => this.divisions = data);
    }
    onDivisionChange() {
        this.selectedDistrictId = null;
        this.selectedUpazilaId = null;
        this.districts = [];
        this.upazilas = [];
        if (this.selectedDivisionId) {
            this.locationService.getDistricts(this.selectedDivisionId).subscribe(data => this.districts = data);
        }
        this.savePreference();
    }
    onDistrictChange() {
        this.selectedUpazilaId = null;
        this.upazilas = [];
        if (this.selectedDistrictId) {
            this.locationService.getUpazilas(this.selectedDistrictId).subscribe(data => this.upazilas = data);
        }
        this.savePreference();
    }
    onUpazilaChange() {
        this.savePreference();
    }
    searchHospitals() {
        if (!this.selectedDivisionId) return;
        this.loading = true;
        this.hospitalService.getHospitalsByArea(
            this.selectedDivisionId,
            this.selectedDistrictId || undefined,
            this.selectedUpazilaId || undefined
        ).subscribe({
            next: (data) => {
                this.hospitals = data;
                this.currentStep = 2;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }
    selectHospital(hospital: Hospital) {
        this.selectedHospital = hospital;
        this.loadDoctors(hospital.id);
    }
    loadDoctors(hospitalId: number) {
        this.loading = true;
        this.appointmentService.getDoctors().subscribe({
            next: (data) => {
                this.doctors = data;
                this.currentStep = 3;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }
    loadSlots(date: string) {
        if (!this.selectedDoctor) return;
        this.loading = true;
        this.appointmentService.getDoctorSlots(this.selectedDoctor.id, date).subscribe({
            next: (slots) => {
                this.availableSlots = slots;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.availableSlots = [];
            }
        });
    }
    selectDoctor(doctor: any) {
        this.selectedDoctor = doctor;
        this.currentStep = 4;
    }
    submit() {
        if (this.form.invalid) return;
        this.loading = true;
        const raw = this.form.getRawValue();
        const appointment: Appointment = {
            patientName: raw.patientName!,
            patientEmail: raw.patientEmail!,
            patientPhone: raw.patientPhone!,
            patientAge: raw.patientAge!,
            patientGender: raw.patientGender!,
            doctorId: this.selectedDoctor.id,
            appointmentDate: raw.appointmentDate!,
            appointmentTime: (raw.appointmentTime!.length === 5) ? raw.appointmentTime! + ':00' : raw.appointmentTime!,
            status: 'pending',
            reason: raw.reason || undefined,
            hospitalId: this.selectedHospital?.id
        };
        this.appointmentService.createAppointment(appointment).subscribe({
            next: () => {
                alert('Appointment booked successfully!');
                this.router.navigate(['/appointments']);
            },
            error: (err) => {
                alert('Error booking appointment: ' + (err.error?.error || 'Unknown error'));
                this.loading = false;
            }
        });
    }
    savePreference() {
        const pref = {
            divisionId: this.selectedDivisionId,
            districtId: this.selectedDistrictId,
            upazilaId: this.selectedUpazilaId
        };
        localStorage.setItem('areaPreference', JSON.stringify(pref));
    }
    loadSavedPreference() {
        const saved = localStorage.getItem('areaPreference');
        if (saved) {
            const pref = JSON.parse(saved);
            this.selectedDivisionId = pref.divisionId;
            if (this.selectedDivisionId) {
                this.locationService.getDistricts(this.selectedDivisionId).subscribe(data => {
                    this.districts = data;
                    this.selectedDistrictId = pref.districtId;
                    if (this.selectedDistrictId) {
                        this.locationService.getUpazilas(this.selectedDistrictId).subscribe(ups => {
                            this.upazilas = ups;
                            this.selectedUpazilaId = pref.upazilaId;
                        });
                    }
                });
            }
        }
    }
    changeArea() {
        this.currentStep = 1;
        this.hospitals = [];
        this.selectedHospital = null;
        this.selectedDoctor = null;
    }
    goBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }
}