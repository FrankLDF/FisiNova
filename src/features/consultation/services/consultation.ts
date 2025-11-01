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

  async startConsultation(appointmentId: number) {
    const res = await serverCore.put(`/appointments/${appointmentId}`, {
      status: 'en_atencion',
    })
    return res.data
  }

  async getPatientHistory(patientId: number) {
    const res = await serverCore.get(`/patients/${patientId}/medical-history`)
    return res.data
  }

  async getLastMedicalRecord(patientId: number) {
    const res = await serverCore.get(`/patients/${patientId}/last-medical-record`)
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
    const res = await serverCore.put(`/appointments/${appointmentId}`, {
      status: 'completada',
    })
    return res.data
  }
}

export default new ConsultationService()