import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { HeartFilled } from '@ant-design/icons'

export const therapyMenu: AppMenuItem = {
  key: '/therapist-dashboard',
  label: 'Terapias',
  requiredRols: [Rol.ADMIN, Rol.THERAPIST],
  icon: React.createElement(HeartFilled),
}
