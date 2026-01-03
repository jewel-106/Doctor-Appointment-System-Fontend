import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Division {
    id: number;
    nameEn: string;
    nameBn?: string;
    code: string;
}
export interface District {
    id: number;
    divisionId: number;
    nameEn: string;
    nameBn?: string;
    code: string;
}
export interface Upazila {
    id: number;
    districtId: number;
    nameEn: string;
    nameBn?: string;
    code: string;
}
@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private apiUrl = `${environment.apiUrl}/api/locations`;
    constructor(private http: HttpClient) { }
    getDivisions(): Observable<Division[]> {
        return this.http.get<Division[]>(`${this.apiUrl}/divisions`);
    }
    getDistricts(divisionId: number): Observable<District[]> {
        return this.http.get<District[]>(`${this.apiUrl}/divisions/${divisionId}/districts`);
    }
    getUpazilas(districtId: number): Observable<Upazila[]> {
        return this.http.get<Upazila[]>(`${this.apiUrl}/districts/${districtId}/upazilas`);
    }
}