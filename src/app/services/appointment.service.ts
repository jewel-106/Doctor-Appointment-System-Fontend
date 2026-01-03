import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private apiUrl = `${environment.apiUrl}/api/appointments`;
    private doctorsUrl = `${environment.apiUrl}/api/doctors`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    getAppointment(id: number): Observable<Appointment> {
        return this.http.get<Appointment>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    createAppointment(appointment: Appointment): Observable<Appointment> {
        return this.http.post<Appointment>(this.apiUrl, appointment, { headers: this.getHeaders() });
    }

    updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment, { headers: this.getHeaders() });
    }

    updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
        return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
    }

    deleteAppointment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    getDoctors(): Observable<any[]> {
        return this.http.get<any[]>(this.doctorsUrl, { headers: this.getHeaders() });
    }

    getDoctorSlots(doctorId: number, date: string): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/api/doctor-slots/doctor/${doctorId}/date/${date}`, { headers: this.getHeaders() });
    }

    createDoctorSlots(slots: any[]): Observable<any[]> {
        return this.http.post<any[]>(`${environment.apiUrl}/api/doctor-slots/batch`, slots, { headers: this.getHeaders() });
    }
}
