import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { DollarCircleOutlined, FundOutlined } from '@ant-design/icons'

export const reportsMenu: AppMenuItem = {
  key: 'reports',
  label: 'Reportes',
  requiredRols: [Rol.ADMIN, Rol.SECRETARY],
  icon: React.createElement(FundOutlined),
  children: [
    {
      key: '/reports-insourance-dashboard',
      label: 'Aseguradoras',
      requiredRols: [Rol.ADMIN, Rol.SECRETARY],
      icon: React.createElement(DollarCircleOutlined),
    },
  ],
}
