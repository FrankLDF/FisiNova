import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'
import type {
  CreateAppointmentRequest,
  AppointmentFilters,
  EmployeeFilters,
} from '../models/appointment'

class AppointmentService {
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

  async getEmployees(filters: EmployeeFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/employees?${params}`)
    return res.data
  }

  async checkAvailability(employeeId: number, date: string, startTime: string, endTime: string) {
    const res = await serverCore.post('/appointments/check-availability', {
      employee_id: employeeId,
      appointment_date: date,
      start_time: startTime,
      end_time: endTime,
    })
    return res.data
  }

  async getAppointmentsByEmployeeAndDate(employeeId: number, date: string) {
    const res = await serverCore.get(`/appointments/employee/${employeeId}/date/${date}`)
    return res.data
  }

  async getAvaiableInsuranceCompanies() {
    const defaultFilter = {
      status: 'active',
    }
    const params = buildQueryParams(defaultFilter)

    const res = await serverCore.get(`/insurances?${params}`)
    return res.data
  }

  async getEmployeeAvailability(
    employeeId: number,
    startDate: string,
    endDate: string,
    duration: number = 60
  ) {
    const params = new URLSearchParams()
    params.append('start_date', startDate)
    params.append('end_date', endDate)
    params.append('duration', duration.toString())

    const res = await serverCore.get(
      `/appointments/availability/${employeeId}?${params.toString()}`
    )
    return res.data
  }

  async validateTimeSlot(
    employeeId: number,
    date: string,
    time: string,
    duration: number = 60,
    excludeAppointmentId?: number
  ) {
    const res = await serverCore.post('/appointments/validate-slot', {
      employee_id: employeeId,
      date,
      time,
      duration,
      exclude_appointment_id: excludeAppointmentId,
    })
    return res.data
  }

  async getNextAvailable(employeeId: number, fromDate?: string, duration: number = 60) {
    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    params.append('duration', duration.toString())

    const res = await serverCore.get(
      `/appointments/next-available/${employeeId}?${params.toString()}`
    )
    return res.data
  }
}

export default new AppointmentService()
