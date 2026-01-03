import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppointmentService } from '../../../services/appointment.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Appointment } from '../../../models/appointment.model';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private http = inject(HttpClient);
  private router = inject(Router);
  currentUser = this.authService.getUser();
  isSuperAdmin = this.authService.hasRole('SUPER_ADMIN');
  greeting = '';
  currentDate = new Date();
  systemStats: any = null;
  appointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  totalAppointments = 0;
  todaysCount = 0;
  pendingCount = 0;
  totalDoctors = 13;
  totalRevenue = 12500;
  pendingPayments = 1200;
  refunds = 350;
  hospitalChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doctorChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  userChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };
  ngOnInit() {
    this.setGreeting();
    if (this.isSuperAdmin) {
      this.loadSuperAdminData();
    } else {
      this.loadRegularAdminData();
    }
  }
  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 18) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }
  loadRegularAdminData() {
    this.authService.getSystemStats().subscribe(data => {
      this.systemStats = data;
    });
    this.appointmentService.getAppointments().subscribe(data => {
      this.appointments = data;
      const today = new Date().toISOString().split('T')[0];
      this.todayAppointments = this.appointments.filter(a => a.appointmentDate === today);
      this.totalAppointments = this.appointments.length;
      this.todaysCount = this.todayAppointments.length;
      this.pendingCount = this.appointments.filter(a => a.status === 'pending').length;
      setTimeout(() => {
        this.initializeCharts();
      }, 500);
    });
  }
  initializeCharts() {
    this.createAppointmentChart();
    this.createStatusChart();
    this.createMonthlyEarningsChart();
  }
  createAppointmentChart() {
    const canvas = document.getElementById('appointmentChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const counts = last7Days.map(date =>
      this.appointments.filter(a => a.appointmentDate === date).length
    );
    const labels = last7Days.map(d => {
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Appointments',
          data: counts,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#10b981',
              font: { size: 12, weight: 'bold' },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#6b7280', font: { size: 11 } },
            grid: { color: '#e5e7eb' }
          },
          x: {
            ticks: { color: '#6b7280', font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }
  createStatusChart() {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pending = this.appointments.filter(a => a.status === 'pending').length;
    const confirmed = this.appointments.filter(a => a.status === 'confirmed').length;
    const complete = this.appointments.filter(a => a.status === 'complete').length;
    const cancelled = this.appointments.filter(a => a.status === 'cancelled').length;
    new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Confirmed', 'Complete', 'Cancelled'],
        datasets: [{
          data: [pending, confirmed, complete, cancelled],
          backgroundColor: ['#fbbf24', '#10b981', '#3b82f6', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        cutout: '70%'
      }
    });
  }
  createMonthlyEarningsChart() {
    const canvas = document.getElementById('monthlyEarningsChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0);
    const consultationFee = 500;
    this.appointments.forEach(apt => {
      const aptDate = new Date(apt.appointmentDate);
      if (aptDate.getFullYear() === currentYear && apt.status === 'complete') {
        const month = aptDate.getMonth();
        monthlyData[month] += consultationFee;
      }
    });
    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Monthly Earnings (BDT)',
          data: monthlyData,
          backgroundColor: '#3b82f6',
          hoverBackgroundColor: '#2563eb',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#3b82f6',
              font: { size: 12, weight: 'bold' },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              label: function (context: any) {
                return 'Earnings: ৳' + context.parsed.y.toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              font: { size: 11 },
              callback: function (value: any) {
                return '৳' + value.toLocaleString();
              }
            },
            grid: { color: '#e5e7eb' }
          },
          x: {
            ticks: { color: '#6b7280', font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }
  loadSuperAdminData() {
    this.authService.getSystemStats().subscribe(data => {
      this.systemStats = data;
    });
    this.appointmentService.getAppointments().subscribe(data => {
      this.appointments = data;
      const today = new Date().toISOString().split('T')[0];
      this.todayAppointments = this.appointments.filter(a => a.appointmentDate === today);
      this.totalAppointments = this.appointments.length;
      this.todaysCount = this.todayAppointments.length;
      this.pendingCount = this.appointments.filter(a => a.status === 'pending').length;
      setTimeout(() => {
        this.initializeCharts();
      }, 500);
    });
    this.http.get<any>(`${environment.apiUrl}/api/admin/analytics`).subscribe(data => {
      this.setupCharts(data);
    });
  }
  setupCharts(data: any) {
    const hospitalLabels = Object.keys(data.hospitalsByDivision);
    const hospitalValues = Object.values(data.hospitalsByDivision) as number[];
    this.hospitalChartData = {
      labels: hospitalLabels,
      datasets: [{
        data: hospitalValues,
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#5a5c69']
      }]
    };
    const doctorLabels = Object.keys(data.doctorsBySpecialty);
    const doctorValues = Object.values(data.doctorsBySpecialty) as number[];
    this.doctorChartData = {
      labels: doctorLabels,
      datasets: [{
        data: doctorValues,
        label: 'Doctors',
        backgroundColor: '#4e73df'
      }]
    };
    const userLabels = Object.keys(data.usersByRole);
    const userValues = Object.values(data.usersByRole) as number[];
    this.userChartData = {
      labels: userLabels,
      datasets: [{
        data: userValues,
        backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b']
      }]
    };
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  viewAppointment(id: number) {
    this.router.navigate(['/view', id]);
  }
}