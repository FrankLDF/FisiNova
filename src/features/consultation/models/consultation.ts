// src/features/consultation/models/consultation.ts
export interface Consultation {
  id?: number
  appointment_id: number
  patient_id: number
  employee_id: number
  diagnosis_ids: number[]
  procedure_ids: number[]
  notes?: string
  status: 'pending' | 'completed'
  created_at?: string
  updated_at?: string

  appointment?: any
  patient?: any
  employee?: any
  diagnostics?: DiagnosticStandard[]
  procedures?: ProcedureStandard[]
}

export interface DiagnosticStandard {
  id: number
  description: string
  code?: string
  category?: string
  type?: string
  chronic?: boolean
  active?: boolean
}

export interface ProcedureStandard {
  id: number
  description: string
  standard?: string
  category?: string
  active?: boolean
}

export interface CreateConsultationRequest {
  appointment_id: number
  patient_id: number
  employee_id: number
  diagnosis_ids: number[]
  procedure_ids: number[]
  notes?: string
}