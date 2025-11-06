import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'

class patientService {
  async getPatients(search?: string) {
    const params = buildQueryParams({ search })
    const res = await serverCore.get(`/patients?${params}`)
    return res.data
  }

  async getPatientById(id: number) {
    const res = await serverCore.get(`/patients/${id}`)
    return res.data
  }

  async createPatient(data: any) {
    const res = await serverCore.post('/patients', data)
    return res.data
  }

  async updatePatient(id: number, data: any) {
    const res = await serverCore.put(`/patients/${id}`, data)
    return res.data
  }

  async deletePatient(id: number) {
    const res = await serverCore.delete(`/patients/${id}`)
    return res.data
  }
}

export default new patientService()
