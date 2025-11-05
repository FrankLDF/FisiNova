// src/features/consultation/models/medicalRecord.ts
export interface MedicalRecord {
  id?: number;
  appointment_id: number;
  patient_id: number;
  employee_id: number;

  // Motivo de consulta
  chief_complaint?: string;
  current_illness?: string;

  // Signos vitales
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  oxygen_saturation?: number;

  // Antecedentes personales
  smokes?: boolean;
  smoking_frequency?: string;
  drinks_alcohol?: boolean;
  alcohol_frequency?: string;
  uses_drugs?: boolean;
  drug_type?: string;
  has_diabetes?: boolean;
  has_hypertension?: boolean;
  has_asthma?: boolean;
  other_conditions?: string;
  previous_surgeries?: string;
  current_medications?: string;

  // Antecedentes familiares
  family_history?: string;

  // Alergias
  allergies?: string;

  // Examen físico
  physical_exam?: string;

  // Diagnósticos y procedimientos
  diagnosis_ids?: number[];
  diagnosis_notes?: string;
  procedure_ids?: number[];
  procedure_notes?: string[];
  diagnostics: Array<{ id: number; code: string; description: string }>;
  procedures: Array<{ id: number; code: string; description: string }>;

  // Plan y tratamiento
  therapy_reason?: string;
  treatment_plan?: string;
  prescriptions?: string;
  recommendations?: string;
  therapy_sessions_needed?: number;

  // Notas generales
  general_notes?: string;

  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultationStats {
  pending: number;
  in_progress: number;
  completed_today: number;
  total_today: number;
}
