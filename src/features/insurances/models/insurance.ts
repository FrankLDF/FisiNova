// src/features/insurances/models/insurance.ts

export interface InsuranceModel {
  id?: number
  name: string
  provider_code: string
  active?: boolean
  created_at?: string
  updated_at?: string

  // Contadores opcionales
  patients_count?: number
  appointments_count?: number
}

export interface CreateInsuranceRequest {
  name: string
  provider_code: string
  active?: boolean
}

export interface UpdateInsuranceRequest {
  name?: string
  provider_code?: string
  active?: boolean
}

export interface InsuranceFilters {
  search?: string
  name?: string
  provider_code?: string
  active?: boolean | string
  paginate?: number
  with_patient_count?: boolean
  with_appointment_count?: boolean
}

export interface InsuranceStatistics {
  insurance: {
    id: number
    name: string
    provider_code: string
    active: boolean
  }
  patients: {
    total: number
    active: number
  }
  appointments: {
    total: number
    pending: number
    completed: number
    cancelled: number
  }
  authorizations: {
    total: number
    active: number
    with_pending_sessions: number
  }
  recent_activity: {
    last_appointment?: string
    last_authorization?: string
  }
}
