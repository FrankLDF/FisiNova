import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { IdcardOutlined } from '@ant-design/icons'

export const patient: AppMenuItem = {
  key: '/consult-patients',
  label: 'Pacientes',
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
  icon: React.createElement(IdcardOutlined),
}
