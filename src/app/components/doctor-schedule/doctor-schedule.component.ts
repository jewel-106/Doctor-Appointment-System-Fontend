import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { AppComponent } from '../../app';
@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './doctor-schedule.component.html',
  styleUrls: ['./doctor-schedule.component.css']
})
export class DoctorScheduleComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private app = inject(AppComponent);
  loading = signal(true);
  selectedEvent: Appointment | null = null;
  todayAppointments = signal<Appointment[]>([]);
  showScheduleModal = false;
  schedule = {
    startDate: '',
    endDate: '',
    duration: 30
  };
  weekDays = [
    { name: 'Sunday', id: 0, active: false, blocks: [{ start: '09:00', end: '17:00' }] },
    { name: 'Monday', id: 1, active: true, blocks: [{ start: '09:00', end: '17:00' }] },
    { name: 'Tuesday', id: 2, active: true, blocks: [{ start: '09:00', end: '17:00' }] },
    { name: 'Wednesday', id: 3, active: true, blocks: [{ start: '09:00', end: '17:00' }] },
    { name: 'Thursday', id: 4, active: true, blocks: [{ start: '09:00', end: '17:00' }] },
    { name: 'Friday', id: 5, active: false, blocks: [{ start: '09:00', end: '12:00' }] },
    { name: 'Saturday', id: 6, active: false, blocks: [{ start: '09:00', end: '17:00' }] }
  ];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridDay',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    buttonIcons: {
      prev: 'chevron-left',
      next: 'chevron-right'
    },
    editable: true,
    selectable: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '21:00:00',
    height: 'auto',
    eventClick: (info: any) => {
      this.selectedEvent = info.event.extendedProps.appointment;
    }
  };
  ngOnInit() {
    this.loadAppointments();
  }
  loadAppointments() {
    this.loading.set(true);
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.updateCalendarEvents(appointments);
        this.updateTodayAppointments(appointments);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load appointments', err);
        this.loading.set(false);
      }
    });
  }
  updateCalendarEvents(appointments: Appointment[]) {
    const events: EventInput[] = appointments.map(apt => ({
      title: `${apt.patientName} (${apt.status})`,
      start: `${apt.appointmentDate}T${apt.appointmentTime}`,
      className: apt.status,
      extendedProps: { appointment: apt }
    }));
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }
  changeView(view: string) {
    this.calendarComponent.getApi()?.changeView(view);
  }
  goToToday() {
    this.calendarComponent.getApi()?.today();
  }
  refresh() {
    this.loadAppointments();
  }
  updateStatus(id: number, status: 'confirmed' | 'complete' | 'cancelled') {
    this.appointmentService.updateAppointmentStatus(id, status).subscribe({
      next: () => {
        this.refresh();
        this.app.showToast(`Appointment marked as ${status}`, 'success');
      },
      error: () => this.app.showToast('Something went wrong! Please try again.', 'error')
    });
  }
  viewAppointment(id: number) {
    this.router.navigate(['/view', id]);
  }
  private updateTodayAppointments(all: Appointment[]) {
    const today = new Date().toISOString().split('T')[0];
    this.todayAppointments.set(all.filter(a => a.appointmentDate === today));
  }
  toggleScheduleModal() {
    this.showScheduleModal = !this.showScheduleModal;
  }
  addBlock(dayIndex: number) {
    this.weekDays[dayIndex].blocks.push({ start: '09:00', end: '13:00' });
  }
  removeTimeBlock(dayIndex: number, blockIndex: number) {
    this.weekDays[dayIndex].blocks.splice(blockIndex, 1);
  }
  saveSchedule() {
    const slots: any[] = [];
    const start = new Date(this.schedule.startDate);
    const end = new Date(this.schedule.endDate);
    const doctor = this.authService.getUser();
    if (!this.schedule.startDate || !this.schedule.endDate) {
      this.app.showToast('Please select start and end dates', 'error');
      return;
    }
    if (start > end) {
      this.app.showToast('Start date must be before end date', 'error');
      return;
    }
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dayConfig = this.weekDays.find(wd => wd.id === dayOfWeek);
      if (!dayConfig || !dayConfig.active) continue;
      for (let i = 0; i < dayConfig.blocks.length; i++) {
        for (let j = i + 1; j < dayConfig.blocks.length; j++) {
          const b1 = dayConfig.blocks[i];
          const b2 = dayConfig.blocks[j];
          if ((b1.start < b2.end) && (b1.end > b2.start)) {
            this.app.showToast(`Time blocks overlap on ${dayConfig.name}. Please correct them.`, 'error');
            return;
          }
        }
      }
      for (const block of dayConfig.blocks) {
        let currentTime = new Date(`2000-01-01T${block.start}`);
        const endTime = new Date(`2000-01-01T${block.end}`);
        while (currentTime < endTime) {
          const slotStart = currentTime.toTimeString().substring(0, 5);
          const nextTime = new Date(currentTime.getTime() + this.schedule.duration * 60000);
          if (nextTime > endTime) break;
          const slotEnd = nextTime.toTimeString().substring(0, 5);
          slots.push({
            doctorId: doctor.profileId,
            availableDate: d.toISOString().split('T')[0],
            startTime: slotStart,
            endTime: slotEnd,
            isBooked: false
          });
          currentTime = nextTime;
        }
      }
    }
    if (slots.length === 0) {
      this.app.showToast('No slots generated based on your selection.', 'info');
      return;
    }
    this.loading.set(true);
    this.appointmentService.createDoctorSlots(slots).subscribe({
      next: () => {
        this.app.showToast('Schedule created successfully!', 'success');
        this.showScheduleModal = false;
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.app.showToast('Failed to save schedule.', 'error');
        this.loading.set(false);
      }
    });
  }
  formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}