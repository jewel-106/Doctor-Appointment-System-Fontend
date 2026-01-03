import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HospitalService, Hospital } from '../../../services/hospital.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './admin-users.html',
    styleUrls: ['./admin-users.css']
})
export class AdminUsersComponent implements OnInit {
    private authService = inject(AuthService);
    private hospitalService = inject(HospitalService);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    admins: any[] = [];
    hospitals: Hospital[] = [];
    showForm = false;
    loading = false;
    searchTerm = '';
    form = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        phone: ['', Validators.required],
        hospitalId: [null as number | null]
    });
    ngOnInit() {
        this.loadAdmins();
        this.loadHospitals();
    }
    loadAdmins() {
        this.http.get<any[]>(`${environment.apiUrl}/api/admin/users/admins`).subscribe(data => {
            this.admins = data;
        });
    }
    loadHospitals() {
        this.hospitalService.getAllHospitals().subscribe(data => this.hospitals = data);
    }
    get filteredAdmins() {
        if (!this.searchTerm) return this.admins;
        return this.admins.filter(a =>
            a.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
    openAddModal() {
        this.showForm = true;
        this.form.reset();
    }
    submit() {
        if (this.form.invalid) return;
        this.loading = true;
        const data = this.form.value;
        this.http.post(`${environment.apiUrl}/api/admin/create-admin`, data, {
            params: { hospitalId: data.hospitalId || '' },
            responseType: 'text'
        }).subscribe({
            next: () => {
                alert('Admin created successfully');
                this.showForm = false;
                this.loadAdmins();
                this.loading = false;
            },
            error: () => {
                alert('Failed to create admin');
                this.loading = false;
            }
        });
    }
}