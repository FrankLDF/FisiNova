// src/features/authorization/models/authorization.ts
export interface Authorization {
  id?: number
  appointment_id: number
  patient_id: number
  insurance_id?: number
  created_by: number
  medic_id?: number
  authorization_number: string
  authorization_date: string
  authorization_type: 'ambulatorio' | 'hospitalizacion'
  notes?: string
  services_authorized?: string[]
  active?: boolean
  created_at?: string
  updated_at?: string

  // Datos del paciente
  patient_name?: string
  patient_last_name?: string
  patient_dni?: string
  patient_insurance_code?: string
  patient_gender?: string

  // Datos adicionales del centro o médico
  city?: string
  PSS_code?: string
  stablishment_phone?: string
  medic_name?: string
  medic_specialty?: string

  // Relaciones
  appointment?: {
    id: number
    appointment_date: string
    start_time: string
    end_time: string
    type?: 'consultation' | 'therapy'
  }
  patient?: {
    id: number
    firstname: string
    lastname: string
    dni?: string
  }
  insurance?: {
    id: number
    name: string
  }
  medic?: {
    id: number
    name: string
    specialty?: string
  }
  createdBy?: {
    id: number
    name: string
  }
}

/**
 * Request para confirmar la llegada de un paciente a una cita
 *
 * LÓGICA:
 * - patient_id: Requerido (seleccionado o recién creado)
 * - payment_type: Requerido (insurance, private, workplace_risk)
 * - insurance_id: Requerido si payment_type === "insurance"
 * - authorization_number: Requerido solo si type === "therapy" && payment_type === "insurance"
 * - case_number: Requerido si payment_type === "workplace_risk"
 */
export interface ConfirmAppointmentRequest {
  patient_id?: number
  payment_type: 'insurance' | 'private' | 'workplace_risk'

  // Para seguro
  insurance_id?: number
  insurance_code?: string
  authorization_number?: string // Solo para terapia + seguro
  authorization_date?: string

  // Para riesgo laboral
  case_number?: string

  // General
  notes?: string
  patient_amount?: number
  insurance_amount?: number
  total_amount?: number
}

export interface CreateAuthorizationRequest {
  appointment_id: number
  patient_id: number
  insurance_id?: number
  authorization_number: string
  authorization_date: string
  authorization_type: 'ambulatorio' | 'hospitalizacion'
  notes?: string
  services_authorized?: string[]
}

export interface AuthorizationFilters {
  active?: boolean | string
  appointment_id?: number
  patient_id?: number
  insurance_id?: number
  authorization_number?: string
  from_date?: string
  to_date?: string
  paginate?: number
}
