// src/features/consultation/services/consultation.ts
import serverCore from '../../../interceptors/axiosInstance'
import type { MedicalRecord } from '../models/medicalRecords'

class ConsultationService {
  async getDashboardStats() {
    const res = await serverCore.get('/consultations/dashboard-stats')
    return res.data
  }

  async getMyAppointments(status?: string) {
    const params = status ? `?status=${status}` : ''
    const res = await serverCore.get(`/my-appointments${params}`)
    return res.data
  }

  async getMyPendingAppointments() {
    const res = await serverCore.get('/my-appointments')
    return res.data
  }

  async startConsultation(appointmentId: number) {
    const res = await serverCore.put(`/appointments/${appointmentId}`, {
      status: 'en_atencion',
    })
    return res.data
  }

  async getPatientHistory(patientId: number) {
    const res = await serverCore.get(`/medical-records/patient/${patientId}/history`)
    return res.data
  }

  async createMedicalRecord(data: MedicalRecord) {
    const res = await serverCore.post('/medical-records', data)
    return res.data
  }

  async updateMedicalRecord(id: number, data: Partial<MedicalRecord>) {
    const res = await serverCore.put(`/medical-records/${id}`, data)
    return res.data
  }

  async getMedicalRecord(appointmentId: number) {
    const res = await serverCore.get(`/appointments/${appointmentId}/medical-record`)
    return res.data
  }

  async getDiagnostics(search?: string) {
    const params = search ? `?search=${search}` : ''
    const res = await serverCore.get(`/diagnostic-standards${params}`)
    return res.data
  }

  async getProcedureStandards(search?: string) {
    const params = search ? `?search=${search}` : ''
    const res = await serverCore.get(`/procedure-standards${params}`)
    return res.data
  }

  async completeConsultation(appointmentId: number) {
    const res = await serverCore.post(`/consultations/${appointmentId}/complete`)
    return res.data
  }

  async createConsultation(data: {
    appointment_id: number
    patient_id: number
    employee_id: number
    diagnosis_ids: number[]
    procedure_ids: number[]
    notes?: string
  }) {
    const medicalRecord: MedicalRecord = {
      appointment_id: data.appointment_id,
      patient_id: data.patient_id,
      employee_id: data.employee_id,
      diagnosis_ids: data.diagnosis_ids,
      procedure_ids: data.procedure_ids,
      general_notes: data.notes,
    }

    const res = await serverCore.post('/medical-records', medicalRecord)
    return res.data
  }

  async searchDiagnostics(search: string) {
    const res = await serverCore.get(`/diagnostic-standards?search=${search}`)
    return res.data?.data || res.data || []
  }

  async searchProcedures(search: string) {
    const res = await serverCore.get(`/procedure-standards?search=${search}`)
    return res.data?.data || res.data || []
  }
}

export default new ConsultationService()