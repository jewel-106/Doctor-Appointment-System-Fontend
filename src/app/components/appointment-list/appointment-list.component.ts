import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { HospitalService } from '../../services/hospital.service';
import { LocationService } from '../../services/location.service';
import { Appointment } from '../../models/appointment.model';
import { AppComponent } from '../../app';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css']
})
export class AppointmentListComponent implements OnInit {
  private service = inject(AppointmentService);
  private app = inject(AppComponent);
  private auth = inject(AuthService);
  private router = inject(Router);
  private hospitalService = inject(HospitalService);
  private locationService = inject(LocationService);

  appointments: Appointment[] = [];
  filtered: Appointment[] = [];
  loading = true;
  search = '';
  statusFilter = 'all';


  hospitalFilter: number | null = null;
  divisionFilter: number | null = null;
  districtFilter: number | null = null;
  upazilaFilter: number | null = null;

 
  hospitals: any[] = [];
  divisions: any[] = [];
  districts: any[] = [];
  upazilas: any[] = [];

  page = 1;


  isDoctor = false;
  isAdmin = false;
  isSuperAdmin = false;
  isPatient = false;


  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  ngOnInit(): void {
    this.isDoctor = this.auth.hasRole('DOCTOR');
    this.isAdmin = this.auth.hasRole('ADMIN') || this.auth.hasRole('SUPER_ADMIN');
    this.isSuperAdmin = this.auth.hasRole('SUPER_ADMIN');
    this.isPatient = this.auth.hasRole('PATIENT');
    this.loadAppointments();

    if (this.isSuperAdmin) {
      this.loadFilterData();
    }
  }

  loadFilterData(): void {
    this.hospitalService.getAllHospitals().subscribe(data => this.hospitals = data);
    this.locationService.getDivisions().subscribe(data => this.divisions = data);
  }

  onDivisionChange(): void {
    this.districts = [];
    this.upazilas = [];
    this.districtFilter = null;
    this.upazilaFilter = null;

    if (this.divisionFilter) {
      this.locationService.getDistricts(this.divisionFilter).subscribe(data => this.districts = data);
    }
    this.filter();
  }

  onDistrictChange(): void {
    this.upazilas = [];
    this.upazilaFilter = null;

    if (this.districtFilter) {
      this.locationService.getUpazilas(this.districtFilter).subscribe(data => this.upazilas = data);
    }
    this.filter();
  }

  loadAppointments(): void {
    this.loading = true;
    this.service.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.app.showToast('Failed to load appointments', 'error');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let temp = this.appointments;
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      temp = temp.filter(a =>
        a.patientName.toLowerCase().includes(q) ||
        (a.doctorName && a.doctorName.toLowerCase().includes(q)) ||
        a.patientEmail.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter !== 'all') {
      temp = temp.filter(a => a.status === this.statusFilter);
    }
    this.filtered = temp;
    this.page = 1;
  }

  
  filter(): void {
    this.applyFilters();
  }

  get paginated(): Appointment[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filtered.slice(start, end);
  }

  get totalPages(): number[] {
    const total = Math.ceil(this.filtered.length / this.pageSize);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  goToPage(p: number): void { this.page = p; }
  onPageSizeChange(): void { this.page = 1; }


  viewDetails(id: number): void {
    this.router.navigate(['/view', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/edit', id]);
  }


  delete(id: number): void {
    if (!this.isAdmin) {
      this.app.showToast('Only admin can delete appointments', 'error');
      return;
    }
    if (confirm('Delete this appointment?')) {
      this.service.deleteAppointment(id).subscribe({
        next: () => {
          this.appointments = this.appointments.filter(a => a.id !== id);
          this.applyFilters();
          this.app.showToast('Appointment deleted successfully');
        },
        error: () => this.app.showToast('Delete failed', 'error')
      });
    }
  }


  changeStatus(apt: Appointment, status: 'confirmed' | 'cancelled' | 'complete'): void {
    if (!(this.isAdmin || this.isDoctor)) {
      this.app.showToast('You are not authorized to change status', 'error');
      return;
    }
    this.service.updateAppointment(apt.id!, { ...apt, status }).subscribe({
      next: () => {
        apt.status = status;
        const msg = status === 'complete' ? 'Completed' : status === 'confirmed' ? 'Confirmed' : 'Cancelled';
        this.app.showToast(`Appointment ${msg}!`);
      },
      error: () => this.app.showToast('Status update failed', 'error')
    });
  }

  saveNote(apt: Appointment): void {
    if (!this.isDoctor) {
      this.app.showToast('Only doctors can add advice/notes', 'error');
      return;
    }
    this.service.updateAppointment(apt.id!, apt).subscribe({
      next: () => this.app.showToast('Note saved successfully'),
      error: () => this.app.showToast('Failed to save note', 'error')
    });
  }


  printSlip(apt: Appointment): void {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(`
      <html>
        <head><title>Appointment Slip</title>
        <style>
          body { font-family: 'Poppins', sans-serif; padding: 40px; line-height: 1.8; }
          .header { text-align: center; border-bottom: 4px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 12px; border: 1px solid #ddd; }
          .label { font-weight: bold; background: #f8f9fa; width: 40%; }
        </style>
        </head>
        <body>
          <div class="header">
            <h1>Nagorik Sheba Healthcare</h1>
            <h3>Appointment Slip</h3>
          </div>
          <table>
            <tr><td class="label">Patient</td><td>${apt.patientName}</td></tr>
            <tr><td class="label">Email</td><td>${apt.patientEmail}</td></tr>
            <tr><td class="label">Doctor</td><td>${apt.doctorName || 'N/A'} (${apt.doctorSpecialty || 'General'})</td></tr>
            <tr><td class="label">Date</td><td>${apt.appointmentDate}</td></tr>
            <tr><td class="label">Time</td><td>${apt.appointmentTime.slice(0, 5)}</td></tr>
            <tr><td class="label">Status</td><td><strong>${apt.status.toUpperCase()}</strong></td></tr>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  }
}