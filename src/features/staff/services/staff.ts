// src/features/staff/services/staff.ts

import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'
import type {
  CreateStaffRequest,
  CreateScheduleTemplateRequest,
  CreateStaffScheduleRequest,
  StaffFilters,
  ScheduleTemplateFilters,
  StaffScheduleFilters,
} from '../models/employee'

class StaffService {
  // ========== STAFF ==========
  async getStaff(filters: StaffFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/employees?${params}`)
    return res.data
  }

  async getStaffById(id: number) {
    const res = await serverCore.get(`/employees/${id}`)
    return res.data
  }

  async createStaff(data: CreateStaffRequest) {
    const res = await serverCore.post('/employees', data)
    return res.data
  }

  async updateStaff(id: number, data: Partial<CreateStaffRequest>) {
    const res = await serverCore.put(`/employees/${id}`, data)
    return res.data
  }

  async deleteStaff(id: number) {
    const res = await serverCore.delete(`/employees/${id}`)
    return res.data
  }

  // ========== SCHEDULE TEMPLATES ==========
  async getScheduleTemplates(filters: ScheduleTemplateFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/schedule-templates?${params}`)
    return res.data
  }

  async getScheduleTemplateById(id: number) {
    const res = await serverCore.get(`/schedule-templates/${id}`)
    return res.data
  }

  async createScheduleTemplate(data: CreateScheduleTemplateRequest) {
    const res = await serverCore.post('/schedule-templates', data)
    return res.data
  }

  async updateScheduleTemplate(
    id: number,
    data: Partial<CreateScheduleTemplateRequest>
  ) {
    const res = await serverCore.put(`/schedule-templates/${id}`, data)
    return res.data
  }

  async deleteScheduleTemplate(id: number) {
    const res = await serverCore.delete(`/schedule-templates/${id}`)
    return res.data
  }

  // ========== STAFF SCHEDULES ==========
  async getStaffSchedules(filters: StaffScheduleFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/employee-schedules?${params}`)
    return res.data
  }

  async getStaffScheduleById(id: number) {
    const res = await serverCore.get(`/employee-schedules/${id}`)
    return res.data
  }

  async createStaffSchedule(data: CreateStaffScheduleRequest) {
    const res = await serverCore.post('/employee-schedules', data)
    return res.data
  }

  async updateStaffSchedule(
    id: number,
    data: Partial<CreateStaffScheduleRequest>
  ) {
    const res = await serverCore.put(`/employee-schedules/${id}`, data)
    return res.data
  }

  async deleteStaffSchedule(id: number) {
    const res = await serverCore.delete(`/employee-schedules/${id}`)
    return res.data
  }

  async getWeeklySchedule(staffId: number, startDate?: string) {
    const params = new URLSearchParams()
    if (startDate) {
      params.append('start_date', startDate)
    }
    const res = await serverCore.get(
      `/employee/${staffId}/weekly-schedule?${params.toString()}`
    )
    return res.data
  }

  // ========== CUBICLES ==========
  async getCubicles() {
    const res = await serverCore.get('/cubicles')
    return res.data
  }

  // ========== POSITIONS ==========
  async getPositions() {
    const res = await serverCore.get('/positions')
    return res.data
  }
}

export default new StaffService()
