import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './patient-dashboard.component.html',
    styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private router = inject(Router);
    appointments: Appointment[] = [];
    upcomingAppointments: Appointment[] = [];
    recentAppointments: Appointment[] = [];
    totalAppointments = 0;
    upcomingCount = 0;
    completedCount = 0;
    cancelledCount = 0;
    pendingCount = 0;
    currentPatient: any = null;
    public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: ['Pending', 'Confirmed', 'Complete', 'Cancelled'],
        datasets: [
            {
                data: [0, 0, 0, 0],
                backgroundColor: ['#f6c23e', '#1cc88a', '#4e73df', '#e74a3b'],
                hoverBackgroundColor: ['#dda20a', '#17a673', '#2e59d9', '#be2617'],
                hoverBorderColor: "rgba(234, 236, 244, 1)"
            }
        ]
    };
    public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' }
        }
    };
    ngOnInit() {
        this.currentPatient = this.authService.getUser();
        this.loadData();
    }
    loadData() {
        this.appointmentService.getAppointments().subscribe(data => {
            const patientEmail = this.currentPatient?.email;
            this.appointments = data.filter(a => a.patientEmail === patientEmail);
            this.totalAppointments = this.appointments.length;
            this.completedCount = this.appointments.filter(a => a.status === 'complete').length;
            this.cancelledCount = this.appointments.filter(a => a.status === 'cancelled').length;
            this.pendingCount = this.appointments.filter(a => a.status === 'pending').length;
            const today = new Date().toISOString().split('T')[0];
            this.upcomingAppointments = this.appointments
                .filter(a => a.appointmentDate >= today && a.status !== 'cancelled' && a.status !== 'complete')
                .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
                .slice(0, 5);
            this.upcomingCount = this.upcomingAppointments.length;
            this.recentAppointments = this.appointments
                .sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate))
                .slice(0, 5);
            this.updateChart();
        });
    }
    updateChart() {
        const pending = this.appointments.filter(a => a.status === 'pending').length;
        const confirmed = this.appointments.filter(a => a.status === 'confirmed').length;
        const complete = this.appointments.filter(a => a.status === 'complete').length;
        const cancelled = this.appointments.filter(a => a.status === 'cancelled').length;
        this.doughnutChartData = {
            ...this.doughnutChartData,
            datasets: [{
                ...this.doughnutChartData.datasets[0],
                data: [pending, confirmed, complete, cancelled]
            }]
        };
    }
    navigateTo(path: string) {
        this.router.navigate([path]);
    }
    viewAppointment(id: number) {
        this.router.navigate(['/view', id]);
    }
    printSlip(apt: Appointment) {
        const printWindow = window.open('', '', 'width=800,height=600');
        const html = `
      <html>
        <head>
          <title>Appointment Slip</title>
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
            <h1>BD Healthcare</h1>
            <h3>Appointment Slip</h3>
          </div>
          <table>
            <tr><td class="label">Patient</td><td>${apt.patientName}</td></tr>
            <tr><td class="label">Email</td><td>${apt.patientEmail}</td></tr>
            <tr><td class="label">Doctor</td><td>${apt.doctorName || 'N/A'} (${apt.doctorSpecialty || 'General'})</td></tr>
            <tr><td class="label">Date</td><td>${apt.appointmentDate}</td></tr>
            <tr><td class="label">Time</td><td>${apt.appointmentTime}</td></tr>
            <tr><td class="label">Status</td><td><strong>${apt.status.toUpperCase()}</strong></td></tr>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
        printWindow?.document.write(html);
        printWindow?.document.close();
    }
}