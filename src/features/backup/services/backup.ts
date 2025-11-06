// src/features/backup/services/backup.ts

import serverCore from '../../../interceptors/axiosInstance'
import { buildQueryParams } from '../../../utils/urlParams'
import type {
  CreateBackupRequest,
  CleanBackupsRequest,
  BackupFilters,
} from '../models/backup'

class BackupService {
  /**
   * Obtener lista de backups
   */
  async getBackups(filters: BackupFilters = {}) {
    const params = buildQueryParams(filters)
    const res = await serverCore.get(`/backups?${params}`)
    return res.data
  }

  /**
   * Obtener estadísticas de backups
   */
  async getStats() {
    const res = await serverCore.get('/backups/stats')
    return res.data
  }

  /**
   * Crear nuevo backup
   */
  async createBackup(data: CreateBackupRequest = {}) {
    const res = await serverCore.post('/backups', data)
    return res.data
  }

  /**
   * Limpiar backups antiguos
   */
  async cleanBackups(data: CleanBackupsRequest = { keep_count: 5 }) {
    const res = await serverCore.post('/backups/clean', data)
    return res.data
  }

  /**
   * Descargar backup
   */
  async downloadBackup(filename: string) {
    const res = await serverCore.get(`/backups/download/${filename}`, {
      responseType: 'blob',
    })

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return res.data
  }

  /**
   * Eliminar backup específico
   */
  async deleteBackup(filename: string) {
    const res = await serverCore.delete(`/backups/${filename}`)
    return res.data
  }
}

export default new BackupService()
