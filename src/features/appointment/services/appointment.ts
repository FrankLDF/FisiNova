import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'
import type {
  CreateAppointmentRequest,
  AppointmentFilters,
  EmployeeFilters,
} from '../models/appointment'

// Interfaces para disponibilidad
export interface TimeSlot {
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

class AppointmentService {
  // ========== CRUD de Citas ==========

  async getAppointments(filters: AppointmentFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/appointments?${params}`)
    return res.data
  }

  async getAppointment(id: number) {
    const res = await serverCore.get(`/appointments/${id}`)
    return res.data
  }

  async createAppointment(data: CreateAppointmentRequest) {
    const res = await serverCore.post('/appointments', data)
    return res.data
  }

  async updateAppointment(id: number, data: Partial<CreateAppointmentRequest>) {
    const res = await serverCore.put(`/appointments/${id}`, data)
    return res.data
  }

  async deleteAppointment(id: number) {
    const res = await serverCore.delete(`/appointments/${id}`)
    return res.data
  }

  // ========== Disponibilidad y Validación ==========

  async getDoctorAvailability(
    doctorId: number,
    startDate: string,
    endDate: string,
    duration: number = 60
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      duration: duration.toString(),
    })

    const res = await serverCore.get(`/appointments/availability/${doctorId}?${params}`)
    return res.data.data
  }

  async validateTimeSlot(
    employeeId: number,
    date: string,
    time: string,
    duration: number = 60,
    excludeAppointmentId?: number
  ): Promise<ValidationResponse> {
    const res = await serverCore.post('/appointments/validate-slot', {
      employee_id: employeeId,
      date,
      time,
      duration,
      exclude_appointment_id: excludeAppointmentId,
    })
    return res.data.data
  }

  async getNextAvailableSlot(
    doctorId: number,
    fromDate?: string,
    duration: number = 60
  ): Promise<NextSlotResponse> {
    const params = new URLSearchParams({ duration: duration.toString() })
    if (fromDate) {
      params.append('from_date', fromDate)
    }

    const res = await serverCore.get(`/appointments/next-available/${doctorId}?${params}`)
    return res.data.data
  }

  // ========== Recursos Relacionados ==========

  async getEmployees(filters: EmployeeFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/employees?${params}`)
    return res.data
  }

  async getAvailableInsuranceCompanies() {
    const params = buildQueryParams({ status: 'active' })
    const res = await serverCore.get(`/insurances?${params}`)
    return res.data
  }
}

export default new AppointmentService()
