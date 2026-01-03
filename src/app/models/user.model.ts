// src/app/models/user.model.ts
export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'SUPER_ADMIN';
  phone?: string;
  specialty?: string;
  address?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  hospital?: {
    id: number;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  phone: string;
  specialty?: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'SUPER_ADMIN';
  phone?: string;
  avatar?: string;
  userId?: number;
  profileId?: number;
  address?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  specialty?: string;
  hospitalId?: number;
  hospital?: {
    id: number;
    name: string;
  };
}