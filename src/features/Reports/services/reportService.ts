// src/features/reports/services/reportService.ts
import serverCore from '../../../interceptors/axiosInstance'
import type {
  ReportFilters,
  ReportPreviewData,
  ReportStats,
  ApiResponse,
} from '../models/report'

class ReportService {
  /**
   * Vista previa de datos
   */
  async preview(data: ReportFilters): Promise<ReportPreviewData> {
    try {
      console.log('Sending preview request:', data)

      const response = await serverCore.post<ApiResponse<ReportPreviewData>>(
        '/reports/insurance/preview',
        data
      )

      console.log('Preview response:', response.data)

      // El backend retorna: { data: {...}, error: null }
      // Verificar si viene en response.data.data o directamente en response.data
      if (response.data.data) {
        return response.data.data
      }

      // Si no, asumir que response.data ya es el objeto correcto
      return response.data as any
    } catch (error: any) {
      console.error('Preview error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  }

  /**
   * Descargar reporte
   */
  async download(data: ReportFilters): Promise<void> {
    try {
      console.log('Sending download request:', data)

      const response = await serverCore.post(
        '/reports/insurance/download',
        data,
        { responseType: 'blob' }
      )

      // Verificar el tipo de contenido
      const contentType = response.headers['content-type']
      console.log('Content type:', contentType)

      // Si es JSON, probablemente sea un error
      if (contentType?.includes('application/json')) {
        const text = await response.data.text()
        const error = JSON.parse(text)
        throw new Error(error.error?.message || 'Error al descargar')
      }

      const blob = new Blob([response.data], {
        type:
          contentType ||
          (data.format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const extension = data.format === 'pdf' ? 'pdf' : 'xlsx'
      const insuranceName = data.is_idoppril ? 'IDOPPRIL' : 'Seguro'
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `Reporte_${insuranceName}_${timestamp}.${extension}`

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      console.log('Download completed:', filename)
    } catch (error: any) {
      console.error('Download error:', error)
      throw error
    }
  }

  /**
   * Estadísticas para reportería
   */
  async getReportStats(params?: {
    start_date?: string
    end_date?: string
  }): Promise<ReportStats> {
    try {
      console.log('Fetching report stats:', params)

      const response = await serverCore.get<ApiResponse<ReportStats>>(
        '/reports/insurance/report-stats',
        { params }
      )

      console.log('Stats response:', response.data)

      // Verificar estructura de respuesta
      if (response.data.data) {
        return response.data.data
      }

      return response.data as any
    } catch (error: any) {
      console.error('Stats error:', error)
      // No lanzar error, retornar valores por defecto
      return {
        current_period_amount: '$0.00',
        services_performed: 0,
        patients_attended: 0,
        insurance_amount: '$0.00',
        patient_amount: '$0.00',
      }
    }
  }

  /**
   * Estadísticas por seguro
   */
  async getStatsByInsurance(params?: {
    start_date?: string
    end_date?: string
  }): Promise<any[]> {
    try {
      const response = await serverCore.get<ApiResponse<any[]>>(
        '/reports/insurance/stats-by-insurance',
        { params }
      )

      if (response.data.data) {
        return response.data.data
      }

      return response.data as any
    } catch (error: any) {
      console.error('Stats by insurance error:', error)
      return []
    }
  }

  /**
   * Obtener lista de seguros
   */
  async getInsurances(): Promise<any[]> {
    try {
      const response = await serverCore.get('/insurances')

      console.log('Insurances response:', response.data)

      // Manejar diferentes estructuras de respuesta
      if (response.data.data) {
        // Si viene en { data: {...} }
        if (Array.isArray(response.data.data.data)) {
          return response.data.data.data // Paginación
        }
        if (Array.isArray(response.data.data)) {
          return response.data.data // Array directo
        }
      }

      if (Array.isArray(response.data)) {
        return response.data
      }

      console.warn('Unexpected insurances response format')
      return []
    } catch (error: any) {
      console.error('Insurances error:', error)
      return []
    }
  }
}

export default new ReportService()
