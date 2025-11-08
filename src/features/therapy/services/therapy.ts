import serverCore from '../../../interceptors/axiosInstance'

interface StartSessionData {
  initial_patient_state: string
  initial_observations?: string
}

interface CompleteSessionData {
  selected_procedure_detail_ids: number[]
  procedure_notes?: string
  final_patient_state: string
  final_observations?: string
  next_session_recommendation?: string
  intensity?: 'low' | 'moderate' | 'high'
}

class TherapyService {
  async getMyTherapies(date?: string) {
    const params = date ? `?date=${date}` : ''
    const res = await serverCore.get(`/therapies/my-therapies${params}`)
    return res.data
  }

  async getSession(appointmentId: number) {
    const res = await serverCore.get(`/therapies/${appointmentId}`)
    return res.data
  }

  async getConsultationInfo(appointmentId: number) {
    const res = await serverCore.get(`/therapies/${appointmentId}/consultation-info`)
    return res.data
  }

  async startSession(appointmentId: number, data: StartSessionData) {
    const res = await serverCore.post(`/therapies/${appointmentId}/start`, data)
    return res.data
  }

  async completeSession(appointmentId: number, data: CompleteSessionData) {
    const res = await serverCore.post(`/therapies/${appointmentId}/complete`, data)
    return res.data
  }
}

export default new TherapyService()