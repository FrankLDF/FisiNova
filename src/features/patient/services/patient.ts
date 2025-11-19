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

  /**
   * Obtener vista previa del historial médico
   */
  async previewMedicalHistory(patientId: number) {
    const res = await serverCore.get(`/patients/${patientId}/medical-history/preview`)
    return res.data
  }

  /**
   * Generar y descargar historial médico en PDF
   */
  async generateMedicalHistory(
    patientId: number,
    options?: {
      include_vital_signs?: boolean
      include_medical_history?: boolean
      include_prescriptions?: boolean
      include_therapy_sessions?: boolean
    }
  ) {
    const params = new URLSearchParams()

    if (options?.include_vital_signs !== undefined) {
      params.append('include_vital_signs', options.include_vital_signs ? '1' : '0')
    }
    if (options?.include_medical_history !== undefined) {
      params.append('include_medical_history', options.include_medical_history ? '1' : '0')
    }
    if (options?.include_prescriptions !== undefined) {
      params.append('include_prescriptions', options.include_prescriptions ? '1' : '0')
    }
    if (options?.include_therapy_sessions !== undefined) {
      params.append('include_therapy_sessions', options.include_therapy_sessions ? '1' : '0')
    }

    const res = await serverCore.get(
      `/patients/${patientId}/medical-history/generate?${params.toString()}`,
      {
        responseType: 'blob',
      }
    )

    // Crear descarga automática
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Historial_Medico_${patientId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return res.data
  }
}

export default new patientService()
