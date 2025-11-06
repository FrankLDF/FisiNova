import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { FundOutlined } from '@ant-design/icons'

export const reportsMenu: AppMenuItem = {
  key: '/reports-dashboard',
  label: 'Reportes',
  requiredRols: [Rol.ADMIN, Rol.SECRETARY],
  icon: React.createElement(FundOutlined),
}
