// src/features/reports/models/report.ts

export interface Insurance {
  id: number;
  name: string;
  code?: string;
  provider_code?: string;
  active?: boolean;
}

export interface ReportFilters {
  insurance_id?: number;
  is_idoppril?: boolean;
  start_date: string;
  end_date: string;
  format: 'pdf' | 'excel';
}

export interface ReportService {
  id: number;
  authorization_date: string;
  authorization_number: string;
  insurance_amount: number;
  patient_amount: number;
  total_amount: number;
  patient_name: string;
  patient_last_name: string;
  patient_insurance_code?: string;
  case_number?: string;
  patient_id: number;
  service_type: 'consultation' | 'therapy' | 'admission';
  procedure_description: string;
}

export interface ReportSummary {
  total_services: number;
  total_insurance_amount: number;
  total_patient_amount: number;
  total_amount: number;
  consultations_count: number;
  therapies_count: number;
  admissions_count: number;
}

export interface ReportPreviewData {
  services: ReportService[];
  summary: ReportSummary;
  insurance: Insurance;
  is_workplace_risk: boolean;
  is_idoppril: boolean;
  period: {
    start: string;
    end: string;
  };
  company: {
    name: string;
    rnc: string;
    phone: string;
    city: string;
  };
}

export interface ReportStats {
  current_period_amount: string;
  services_performed: number;
  patients_attended: number;
  insurance_amount: string;
  patient_amount: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}