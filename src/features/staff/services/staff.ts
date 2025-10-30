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
} from '../models/staff'

class StaffService {
  // ========== STAFF ==========
  async getStaff(filters: StaffFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/staff?${params}`)
    return res.data
  }

  async getStaffById(id: number) {
    const res = await serverCore.get(`/staff/${id}`)
    return res.data
  }

  async createStaff(data: CreateStaffRequest) {
    const res = await serverCore.post('/staff', data)
    return res.data
  }

  async updateStaff(id: number, data: Partial<CreateStaffRequest>) {
    const res = await serverCore.put(`/staff/${id}`, data)
    return res.data
  }

  async deleteStaff(id: number) {
    const res = await serverCore.delete(`/staff/${id}`)
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
    const res = await serverCore.get(`/staff-schedules?${params}`)
    return res.data
  }

  async getStaffScheduleById(id: number) {
    const res = await serverCore.get(`/staff-schedules/${id}`)
    return res.data
  }

  async createStaffSchedule(data: CreateStaffScheduleRequest) {
    const res = await serverCore.post('/staff-schedules', data)
    return res.data
  }

  async updateStaffSchedule(
    id: number,
    data: Partial<CreateStaffScheduleRequest>
  ) {
    const res = await serverCore.put(`/staff-schedules/${id}`, data)
    return res.data
  }

  async deleteStaffSchedule(id: number) {
    const res = await serverCore.delete(`/staff-schedules/${id}`)
    return res.data
  }

  async getWeeklySchedule(staffId: number, startDate?: string) {
    const params = new URLSearchParams()
    if (startDate) {
      params.append('start_date', startDate)
    }
    const res = await serverCore.get(
      `/staff/${staffId}/weekly-schedule?${params.toString()}`
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
