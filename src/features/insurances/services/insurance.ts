// src/features/insurances/services/insurance.ts

import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'
import type {
  CreateInsuranceRequest,
  UpdateInsuranceRequest,
  InsuranceFilters,
} from '../models/insurance'

class InsuranceService {
  async getInsurances(filters: InsuranceFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/insurances?${params}`)
    return res.data
  }

  async getInsuranceById(id: number) {
    const res = await serverCore.get(`/insurances/${id}`)
    return res.data
  }

  async createInsurance(data: CreateInsuranceRequest) {
    const res = await serverCore.post('/insurances', data)
    return res.data
  }

  async updateInsurance(id: number, data: UpdateInsuranceRequest) {
    const res = await serverCore.put(`/insurances/${id}`, data)
    return res.data
  }

  async deleteInsurance(id: number) {
    const res = await serverCore.delete(`/insurances/${id}`)
    return res.data
  }

  async toggleActive(id: number) {
    const res = await serverCore.post(`/insurances/${id}/toggle-active`)
    return res.data
  }

  async getStatistics(id: number) {
    const res = await serverCore.get(`/insurances/${id}/statistics`)
    return res.data
  }
}

export default new InsuranceService()
