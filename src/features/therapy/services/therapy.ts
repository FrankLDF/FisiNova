import serverCore from '../../../interceptors/axiosInstance'

class TherapyService {
  async createTherapyAppointments(data: {
    consultation_appointment_id: number
    therapist_id: number
    dates: string[]
    start_time: string
    end_time: string
  }) {
    const res = await serverCore.post('/therapy-appointments', data)
    return res.data
  }

  async completeSession(appointmentId: number, notes?: string) {
    const res = await serverCore.post(`/therapy-appointments/${appointmentId}/complete`, { notes })
    return res.data
  }
}

export default new TherapyService()