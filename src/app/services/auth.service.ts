import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/api/auth`;
    private doctorsUrl = `${environment.apiUrl}/api/doctors`;
    private adminUrl = `${environment.apiUrl}/api/admin`;
    private tokenKey = 'jwt_token';
    private userKey = 'current_user';
    private router = inject(Router);
    constructor(private http: HttpClient) { }
    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(tap(res => this.setSession(res)));
    }
    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
            .pipe(tap(res => this.setSession(res)));
    }
    private setSession(authResult: AuthResponse) {
        localStorage.setItem(this.tokenKey, authResult.token);
        localStorage.setItem(this.userKey, JSON.stringify({
            name: authResult.name,
            email: authResult.email,
            role: authResult.role,
            phone: authResult.phone || '',
            avatar: authResult.avatar || '',
            address: authResult.address || '',
            bio: authResult.bio || '',
            gender: authResult.gender || '',
            dateOfBirth: authResult.dateOfBirth || '',
            hospitalId: authResult.hospitalId,
            profileId: authResult.profileId,
            specialty: authResult.specialty || ''
        }));
    }
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.router.navigate(['/login']);
    }
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }
    getUser(): any {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }
    isLoggedIn(): boolean {
        return !!this.getToken();
    }
    hasRole(role: string): boolean {
        const user = this.getUser();
        return user?.role === role;
    }
    updateProfile(data: { name: string; email: string; phone?: string; address?: string; bio?: string; gender?: string; dateOfBirth?: string; specialty?: string }): Observable<AuthResponse> {
        return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, data)
            .pipe(
                tap((res: AuthResponse) => {
                    this.setSession(res);
                })
            );
    }
    updateAvatar(avatar: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/avatar`, { avatar }, { responseType: 'text' })
            .pipe(
                tap(() => {
                    this.updateLocalUser({ avatar });
                })
            );
    }
    changePassword(currentPassword: string, newPassword: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/change-password`, {
            currentPassword,
            newPassword
        }, { responseType: 'text' });
    }
    sendForgotPasswordOtp(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { responseType: 'text' });
    }
    verifyResetOtp(email: string, otp: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }, { responseType: 'text' });
    }
    resetPassword(email: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, { email, newPassword }, { responseType: 'text' });
    }
    resendOtp(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { responseType: 'text' });
    }
    updateLocalUser(partial: any) {
        const current = this.getUser();
        if (current) {
            const updated = { ...current, ...partial };
            localStorage.setItem(this.userKey, JSON.stringify(updated));
        }
    }
    addDoctor(data: any): Observable<any> {
        return this.http.post(`${this.adminUrl}/add-doctor`, data, { responseType: 'text' });
    }
    getDoctors(): Observable<any[]> {
        return this.http.get<any[]>(this.doctorsUrl);
    }
    updateDoctorStatus(id: number, active: boolean): Observable<any> {
        return this.http.patch(`${this.doctorsUrl}/${id}/status`, {}, { params: { active: active.toString() } });
    }
    updateDoctor(id: number, data: any): Observable<any> {
        return this.http.put(`${this.doctorsUrl}/${id}`, data);
    }
    getSystemStats(): Observable<any> {
        return this.http.get(`${this.adminUrl}/stats`);
    }
}