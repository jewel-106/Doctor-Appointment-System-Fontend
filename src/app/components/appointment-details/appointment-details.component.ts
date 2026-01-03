import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.css']
})
export class AppointmentDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  appointment: Appointment | null = null;
  loading = true;
  currentUser: any = null;
  isDoctor = false;
  isAdmin = false;
  isPatient = false;
  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.isDoctor = this.authService.hasRole('DOCTOR');
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.isPatient = this.authService.hasRole('PATIENT');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAppointment(+id);
    }
  }
  loadAppointment(id: number) {
    this.appointmentService.getAppointment(id).subscribe({
      next: (data: Appointment) => {
        this.appointment = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading appointment:', err);
        this.loading = false;
        this.router.navigate(['/appointments']);
      }
    });
  }
  goBack() {
    this.router.navigate(['/appointments']);
  }
  editAppointment() {
    if (this.appointment?.id) {
      this.router.navigate(['/edit', this.appointment.id]);
    }
  }
  printAppointment() {
    if (!this.appointment) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Appointment Details</title>
          <style>
            body { font-family: 'Poppins', sans-serif; padding: 40px; line-height: 1.8; }
            .header { text-align: center; border-bottom: 4px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; color: #667eea; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
            .info-row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 200px; color: #555; }
            .value { color: #333; }
            .status { padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .status-pending { background: #ffc107; color: #000; }
            .status-confirmed { background: #28a745; color: #fff; }
            .status-complete { background: #007bff; color: #fff; }
            .status-cancelled { background: #dc3545; color: #fff; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BD Healthcare</h1>
            <h2>Appointment Details</h2>
            <p>Appointment ID: #${this.appointment.id}</p>
          </div>
          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-row"><div class="label">Name:</div><div class="value">${this.appointment.patientName}</div></div>
            <div class="info-row"><div class="label">Email:</div><div class="value">${this.appointment.patientEmail}</div></div>
            <div class="info-row"><div class="label">Phone:</div><div class="value">${this.appointment.patientPhone}</div></div>
            <div class="info-row"><div class="label">Age:</div><div class="value">${this.appointment.patientAge || 'N/A'}</div></div>
            <div class="info-row"><div class="label">Gender:</div><div class="value">${this.appointment.patientGender || 'N/A'}</div></div>
          </div>
          <div class="section">
            <div class="section-title">Appointment Information</div>
            <div class="info-row"><div class="label">Doctor:</div><div class="value">${this.appointment.doctorName || 'N/A'}</div></div>
            <div class="info-row"><div class="label">Specialty:</div><div class="value">${this.appointment.doctorSpecialty || 'General'}</div></div>
            <div class="info-row"><div class="label">Date:</div><div class="value">${this.appointment.appointmentDate}</div></div>
            <div class="info-row"><div class="label">Time:</div><div class="value">${this.appointment.appointmentTime}</div></div>
            <div class="info-row"><div class="label">Status:</div><div class="value"><span class="status status-${this.appointment.status}">${this.appointment.status.toUpperCase()}</span></div></div>
          </div>
          ${this.appointment.reason ? `
          <div class="section">
            <div class="section-title">Reason for Visit</div>
            <div class="value">${this.appointment.reason}</div>
          </div>
          ` : ''}
          ${this.appointment.notes ? `
          <div class="section">
            <div class="section-title">Doctor's Notes / Advice</div>
            <div class="value">${this.appointment.notes}</div>
          </div>
          ` : ''}
          ${this.appointment.diagnosis ? `
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <div class="value">${this.appointment.diagnosis}</div>
          </div>
          ` : ''}
          ${this.appointment.prescription ? `
          <div class="section">
            <div class="section-title">Prescription</div>
            <div class="value">${this.appointment.prescription}</div>
          </div>
          ` : ''}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  }
}