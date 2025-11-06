// Agregar al menu: src/features/consultation/menu/consultation.ts
import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { ContactsOutlined } from '@ant-design/icons'

export const consultationMenu: AppMenuItem = {
  key: '/my-consultations',
  label: 'Consultas',
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
  icon: React.createElement(ContactsOutlined),
}
