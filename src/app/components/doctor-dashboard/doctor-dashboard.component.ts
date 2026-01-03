import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { ToastService } from '../../services/toast.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  appointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  totalPatients = 0;
  todaysCount = 0;
  pendingCount = 0;
  completedCount = 0;
  totalEarnings = 0;
  monthlyEarnings = 0;
  confirmedCount = 0;
  cancelledCount = 0;
  thisWeekCount = 0;
  avgDailyPatients = 0;
  currentDoctor: any = null;
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Appointments',
        fill: true,
        tension: 0.4,
        borderColor: '#1cc88a',
        backgroundColor: 'rgba(28, 200, 138, 0.05)',
        pointBackgroundColor: '#1cc88a',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1cc88a'
      }
    ]
  };
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Pending', 'Confirmed', 'Complete', 'Cancelled'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#f6c23e', '#1cc88a', '#4e73df', '#e74a3b'],
        hoverBackgroundColor: ['#dda20a', '#17a673', '#2e59d9', '#be2617'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
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
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        label: 'Monthly Earnings (BDT)',
        backgroundColor: '#4e73df',
        hoverBackgroundColor: '#2e59d9',
      }
    ]
  };
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  ngOnInit() {
    this.currentDoctor = this.authService.getUser();
    console.log('Logged in user:', this.currentDoctor);
    this.loadData();
  }
  loadData() {
    this.appointmentService.getAppointments().subscribe(data => {
      console.log('All appointments:', data);
      console.log('Current user:', this.currentDoctor);
      const doctorId = this.currentDoctor?.id;
      console.log('Doctor ID for filtering:', doctorId);
      if (doctorId) {
        this.appointments = data.filter(a => {
          console.log(`Comparing appointment doctorId: ${a.doctorId} with current doctor ID: ${doctorId}`);
          return a.doctorId === doctorId;
        });
      } else {
        this.appointments = data;
      }
      console.log('Filtered appointments for this doctor:', this.appointments);
      const today = new Date().toISOString().split('T')[0];
      console.log('Today:', today);
      this.todayAppointments = this.appointments.filter(a => a.appointmentDate === today);
      console.log('Today\'s appointments:', this.todayAppointments);
      this.todaysCount = this.todayAppointments.length;
      this.pendingCount = this.appointments.filter(a => a.status === 'pending').length;
      this.completedCount = this.appointments.filter(a => a.status === 'complete').length;
      this.confirmedCount = this.appointments.filter(a => a.status === 'confirmed').length;
      this.cancelledCount = this.appointments.filter(a => a.status === 'cancelled').length;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      this.thisWeekCount = this.appointments.filter(a => a.appointmentDate >= weekAgoStr).length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      const last30DaysCount = this.appointments.filter(a => a.appointmentDate >= thirtyDaysAgoStr).length;
      this.avgDailyPatients = Math.round(last30DaysCount / 30);
      const uniquePatients = new Set(this.appointments.map(a => a.patientEmail));
      this.totalPatients = uniquePatients.size;
      this.updateCharts(this.appointments);
      console.log('Stats:', {
        total: this.appointments.length,
        today: this.todaysCount,
        pending: this.pendingCount,
        confirmed: this.confirmedCount,
        completed: this.completedCount,
        cancelled: this.cancelledCount,
        thisWeek: this.thisWeekCount,
        avgDaily: this.avgDailyPatients,
        patients: this.totalPatients,
        totalEarnings: this.totalEarnings,
        monthlyEarnings: this.monthlyEarnings
      });
    });
  }
  updateCharts(data: Appointment[]) {
    const pending = data.filter(a => a.status === 'pending').length;
    const confirmed = data.filter(a => a.status === 'confirmed').length;
    const complete = data.filter(a => a.status === 'complete').length;
    const cancelled = data.filter(a => a.status === 'cancelled').length;
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [{
        ...this.doughnutChartData.datasets[0],
        data: [pending, confirmed, complete, cancelled]
      }]
    };
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const counts = last7Days.map(date => data.filter(a => a.appointmentDate === date).length);
    this.lineChartData = {
      labels: last7Days.map(d => {
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: counts
      }]
    };
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0);
    const consultationFee = 500;
    data.forEach(apt => {
      const aptDate = new Date(apt.appointmentDate);
      if (aptDate.getFullYear() === currentYear && apt.status === 'complete') {
        const month = aptDate.getMonth();
        monthlyData[month] += consultationFee;
      }
    });
    this.barChartData = {
      ...this.barChartData,
      datasets: [{
        ...this.barChartData.datasets[0],
        data: monthlyData
      }]
    };
    this.totalEarnings = monthlyData.reduce((sum, val) => sum + val, 0);
    const currentMonth = new Date().getMonth();
    this.monthlyEarnings = monthlyData[currentMonth];
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  edit(id: number) {
    this.router.navigate(['/edit', id]);
  }
  viewAppointment(id: number) {
    this.router.navigate(['/view', id]);
  }
  changeStatus(apt: Appointment, status: 'confirmed' | 'cancelled' | 'complete') {
    this.appointmentService.updateAppointment(apt.id!, { ...apt, status }).subscribe({
      next: () => {
        this.toastService.show(`Appointment ${status}`);
        this.loadData();
      },
      error: () => this.toastService.show('Failed to update status', 'error')
    });
  }
  printSlip(apt: Appointment) {
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
    `);
    printWindow?.document.close();
  }
}