// src/features/staff/menu/staff.ts

import { Rol, type AppMenuItem } from '../../../utils/constants'
import { PATH_CONSULT_STAFF, PATH_CREATE_STAFF } from './path'

export const staffMenu: AppMenuItem = {
  key: 'staff-management',
  label: 'Personal',
  requiredRols: [Rol.ADMIN],
  children: [
    {
      key: PATH_CONSULT_STAFF,
      label: 'Consultar Personal',
      requiredRols: [Rol.ADMIN],
    },
    {
      key: PATH_CREATE_STAFF,
      label: 'Crear Personal',
      requiredRols: [Rol.ADMIN],
    },
  ],
}
