import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HospitalService, Hospital } from '../../../services/hospital.service';
import { LocationService, Division, District, Upazila } from '../../../services/location.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-admin-hospitals',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './admin-hospitals.html'
})
export class AdminHospitalsComponent implements OnInit {
    private hospitalService = inject(HospitalService);
    private locationService = inject(LocationService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    hospitals: Hospital[] = [];
    divisions: Division[] = [];
    districts: District[] = [];
    upazilas: Upazila[] = [];

    showForm = false;
    isEdit = false;
    loading = false;
    isSingleHospitalMode = false;
    selectedHospital: Hospital | null = null;

    form = this.fb.group({
        id: [null as number | null],
        name: ['', Validators.required],
        code: ['', Validators.required],
        divisionId: [null as number | null, Validators.required],
        districtId: [null as number | null, Validators.required],
        upazilaId: [null as number | null],
        addressLine1: ['', Validators.required],
        phonePrimary: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        isActive: [true],
        logoUrl: ['']
    });

    ngOnInit() {
        const user = this.authService.getUser();
        if (user?.role === 'ADMIN' && user.hospitalId) {
            this.isSingleHospitalMode = true;
            this.loadSingleHospital(user.hospitalId);
        } else {
            this.loadHospitals();
        }
        this.loadDivisions();
    }

    loadSingleHospital(id: number) {
        this.loading = true;
        this.hospitalService.getHospital(id).subscribe({
            next: (data) => {
                this.selectedHospital = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    loadHospitals() {
        this.loading = true;
        this.hospitalService.getAllHospitals().subscribe({
            next: (data) => {
                this.hospitals = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    loadDivisions() {
        this.locationService.getDivisions().subscribe(data => this.divisions = data);
    }

    onDivisionChange() {
        const divId = this.form.get('divisionId')?.value;
        this.districts = [];
        this.upazilas = [];
        this.form.patchValue({ districtId: null, upazilaId: null });

        if (divId) {
            this.locationService.getDistricts(divId).subscribe(data => this.districts = data);
        }
    }

    onDistrictChange() {
        const disId = this.form.get('districtId')?.value;
        this.upazilas = [];
        this.form.patchValue({ upazilaId: null });

        if (disId) {
            this.locationService.getUpazilas(disId).subscribe(data => this.upazilas = data);
        }
    }

    openAddModal() {
        this.isEdit = false;
        this.showForm = true;
        this.form.reset({ isActive: true });
    }

    enableEdit() {
        if (this.selectedHospital) {
            this.editHospital(this.selectedHospital);
        }
    }

    editHospital(hospital: Hospital) {
        this.isEdit = true;
        this.showForm = true;

        this.form.patchValue({
            id: hospital.id,
            name: hospital.name,
            code: hospital.code,
            divisionId: hospital.division?.id,
            districtId: hospital.district?.id,
            upazilaId: hospital.upazila?.id,
            addressLine1: hospital.addressLine1,
            phonePrimary: hospital.phonePrimary,
            email: hospital.email,
            isActive: hospital.isActive,
            logoUrl: hospital.logoUrl
        });

        if (hospital.division?.id) {
            this.locationService.getDistricts(hospital.division.id).subscribe(data => {
                this.districts = data;
                if (hospital.district?.id) {
                    this.locationService.getUpazilas(hospital.district.id).subscribe(ups => this.upazilas = ups);
                }
            });
        }
    }

    submit() {
        if (this.form.invalid) return;

        this.loading = true;
        const data = this.form.value;

        const payload: any = {
            ...data,
            division: data.divisionId ? { id: data.divisionId } : null,
            district: data.districtId ? { id: data.districtId } : null,
            upazila: data.upazilaId ? { id: data.upazilaId } : null
        };

        const req = this.isEdit
            ? this.hospitalService.updateHospital(data.id!, payload)
            : this.hospitalService.createHospital(payload);

        req.subscribe({
            next: () => {
                alert(this.isEdit ? 'Hospital updated' : 'Hospital created');
                if (this.isSingleHospitalMode) {
                    this.showForm = false;
                    this.loadSingleHospital(this.selectedHospital!.id);
                } else {
                    this.showForm = false;
                    this.loadHospitals();
                }
            },
            error: (err) => {
                alert('Failed to save hospital');
                this.loading = false;
            }
        });
    }

    deleteHospital(id: number) {
        if (confirm('Are you sure?')) {
            this.hospitalService.deleteHospital(id).subscribe(() => this.loadHospitals());
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.form.patchValue({ logoUrl: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }
}
