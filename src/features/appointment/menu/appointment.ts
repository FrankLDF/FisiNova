import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { PATH_CONSULT_APPOINTMENTS } from './path'
import { ScheduleOutlined } from '@ant-design/icons'

export const appointment: AppMenuItem = {
  key: PATH_CONSULT_APPOINTMENTS,
  label: 'Citas',
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST, Rol.SECRETARY],
  icon: React.createElement(ScheduleOutlined),
}
