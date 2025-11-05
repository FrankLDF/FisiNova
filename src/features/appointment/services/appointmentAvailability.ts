import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'

export interface TimeSlot {
  start: string
  end: string
  start_time: string
  end_time: string
  display: string
  is_available: boolean
  cubicle?: string
}

export interface DayAvailability {
  date: string
  day_name: string
  day_of_week: number
  slots: TimeSlot[]
  available_count: number
  total_count: number
}

export interface AvailabilityResponse {
  doctor_id: number
  date_range: {
    start: string
    end: string
  }
  duration: number
  days: DayAvailability[]
  total_available_slots: number
}

export interface ValidationResponse {
  is_available: boolean
  reason: string | null
  message: string
  conflicting_appointment?: {
    id: number
    time: string
    patient: string
  }
}

export interface NextSlotResponse {
  date: string
  time: string
  end_time: string
  display: string
}

class AppointmentAvailabilityService {
  async getDoctorAvailability(
    doctorId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityResponse> {
    const response = await serverCore.get(`/appointments/availability/${doctorId}`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
    return response.data.data
  }

  async validateTimeSlot(
    doctorId: number,
    date: string,
    time: string,
    excludeAppointmentId?: number
  ): Promise<ValidationResponse> {
    const response = await serverCore.post('/appointments/validate-slot', {
      doctor_id: doctorId,
      date,
      time,
      exclude_appointment_id: excludeAppointmentId,
    })
    return response.data.data
  }

  async getNextAvailableSlot(
    doctorId: number,
    fromDate?: string,
  ): Promise<NextSlotResponse> {
    const response = await serverCore.get(`/appointments/next-available/${doctorId}`, {
      params: {
        from_date: fromDate,
      },
    })
    return response.data.data
  }

  async getAvailabilitySummary(doctorId: number) {
    const response = await serverCore.get(`/appointments/availability-summary/${doctorId}`)
    return response.data.data
  }
}

export default new AppointmentAvailabilityService()
