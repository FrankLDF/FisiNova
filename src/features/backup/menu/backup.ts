// src/features/backup/menu/backup.ts

import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { DatabaseOutlined } from '@ant-design/icons'

export const backupMenu: AppMenuItem = {
  key: '/backup-management',
  label: 'Backups',
  requiredRols: [Rol.ADMIN],
  icon: React.createElement(DatabaseOutlined),
}

// src/features/backup/menu/path.ts
export const PATH_BACKUP_MANAGEMENT = '/backup-management'
