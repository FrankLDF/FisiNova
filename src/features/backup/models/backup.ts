// src/features/backup/models/backup.ts

export interface Backup {
  filename: string
  path: string
  size: number
  size_formatted: string
  created_at: string
  type: 'manual' | 'automatic'
}

export interface BackupStats {
  total_backups: number
  total_size: number
  total_size_formatted: string
  oldest_backup?: string
  newest_backup?: string
  last_backup_date?: string
  disk_usage?: {
    total: number
    used: number
    free: number
    percentage: number
  }
}

export interface CreateBackupRequest {
  type?: 'manual' | 'automatic'
  description?: string
}

export interface CleanBackupsRequest {
  keep_count?: number
}

export interface BackupFilters {
  paginate?: number
  type?: 'manual' | 'automatic'
  from_date?: string
  to_date?: string
}
