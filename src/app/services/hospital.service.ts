import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Hospital {
    id: number;
    name: string;
    code: string;
    divisionId?: number;
    districtId?: number;
    upazilaId?: number;
    division?: { id: number; nameEn: string };
    district?: { id: number; nameEn: string };
    upazila?: { id: number; nameEn: string };
    phonePrimary: string;
    email: string;
    addressLine1: string;
    logoUrl?: string;
    tagline?: string;
    operatingHours?: string;
    isActive?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HospitalService {
    private apiUrl = `${environment.apiUrl}/api/hospitals`;

    constructor(private http: HttpClient) { }

    getAllHospitals(): Observable<Hospital[]> {
        return this.http.get<Hospital[]>(this.apiUrl);
    }

    getHospital(id: number): Observable<Hospital> {
        return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
    }

    getDefaultHospital(): Observable<Hospital> {
        return this.http.get<Hospital>(`${this.apiUrl}/default`);
    }

    getHospitalsByArea(divisionId: number, districtId?: number, upazilaId?: number): Observable<Hospital[]> {
        let params = new HttpParams().set('divisionId', divisionId.toString());

        if (districtId) {
            params = params.set('districtId', districtId.toString());
        }

        if (upazilaId) {
            params = params.set('upazilaId', upazilaId.toString());
        }

        return this.http.get<Hospital[]>(`${this.apiUrl}/by-area`, { params });
    }

    createHospital(hospital: any): Observable<Hospital> {
        return this.http.post<Hospital>(this.apiUrl, hospital);
    }

    updateHospital(id: number, hospital: any): Observable<Hospital> {
        return this.http.put<Hospital>(`${this.apiUrl}/${id}`, hospital);
    }

    deleteHospital(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
