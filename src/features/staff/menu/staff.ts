// src/features/staff/menu/staff.ts

import { Rol, type AppMenuItem } from '../../../utils/constants'
import {
  PATH_CONSULT_STAFF,
  PATH_CREATE_STAFF,
  PATH_CONSULT_SCHEDULES,
  PATH_CREATE_SCHEDULE_TEMPLATE,
  PATH_ASSIGN_SCHEDULE,
} from './path'

export const staffMenu: AppMenuItem = {
  key: 'staff-management',
  label: 'Gestión de Personal',
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
    {
      key: 'schedules-submenu',
      label: 'Horarios',
      requiredRols: [Rol.ADMIN],
      children: [
        {
          key: PATH_CONSULT_SCHEDULES,
          label: 'Plantillas de Horarios',
          requiredRols: [Rol.ADMIN],
        },
        {
          key: PATH_CREATE_SCHEDULE_TEMPLATE,
          label: 'Crear Plantilla',
          requiredRols: [Rol.ADMIN],
        },
        {
          key: PATH_ASSIGN_SCHEDULE,
          label: 'Asignar Horarios',
          requiredRols: [Rol.ADMIN],
        },
      ],
    },
  ],
}
