export interface Appointment {
    id?: number;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorId: number;
    doctorName?: string;
    doctorSpecialty?: string;
    appointmentDate: string;
    appointmentTime: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'complete';
    notes?: string;
    patientComment?: string;
    reason?: string;
    previousPrescription?: string;
    prescription?: string;
    diagnosis?: string;
    patientAge?: string;
    patientGender?: string;
    emergencyContact?: string;
    hospitalId?: number;
}