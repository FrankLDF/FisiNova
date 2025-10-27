export interface Authorization {
  id?: number;
  appointment_id: number;
  patient_id: number;
  insurance_id?: number;
  created_by: number;
  medic_id?: number;
  authorization_number: string;
  authorization_date: string;
  authorization_type: "ambulatorio" | "hospitalizacion";
  notes?: string;
  services_authorized?: string[];
  active?: boolean;
  created_at?: string;
  updated_at?: string;

  // Datos del paciente (si se incluyen en la respuesta)
  patient_name?: string;
  patient_last_name?: string;
  patient_dni?: string;
  patient_insurance_code?: string;
  patient_gender?: string;

  // Datos adicionales del centro o médico
  city?: string;
  PSS_code?: string;
  stablishment_phone?: string;
  medic_name?: string;
  medic_specialty?: string;

  // Relaciones
  appointment?: {
    id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
  };
  patient?: {
    id: number;
    firstname: string;
    lastname: string;
    dni?: string;
  };
  insurance?: {
    id: number;
    name: string;
  };
  medic?: {
    id: number;
    name: string;
    specialty?: string;
  };
  createdBy?: {
    id: number;
    name: string;
  };
}
export interface ConfirmAppointmentRequest {
  payment_type: "insurance" | "private";
  authorization_number?: string;
  insurance_id?: number;
  authorization_date?: string;
  notes?: string;
}

export interface CreateAuthorizationRequest {
  appointment_id: number;
  patient_id: number;
  insurance_id?: number;
  authorization_number: string;
  authorization_date: string;
  authorization_type: "ambulatorio" | "hospitalizacion";
  notes?: string;
  services_authorized?: string[];
}

export interface AuthorizationFilters {
  active?: boolean | string;
  appointment_id?: number;
  patient_id?: number;
  insurance_id?: number;
  authorization_number?: string;
  from_date?: string;
  to_date?: string;
  paginate?: number;
}
