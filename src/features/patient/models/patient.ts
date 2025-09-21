// src/features/patient/models/patient.ts
export interface Patient {
  id?: number;
  firstname: string;
  lastname: string;
  dni?: string;
  passport?: string;
  sex?: string;
  birthdate?: string;
  email?: string;
  phone?: string;
  cellphone?: string;
  address?: string;
  city?: string;
  insurance_code?: string;
  insurance_id?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  
  insurance?: {
    id: number;
    name: string;
    provider_code?: string;
  };
}