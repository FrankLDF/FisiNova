import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { insuranceMenu } from '../../insurances/menu/insurance'
import {
  PATH_ASSIGN_SCHEDULE,
  PATH_CONSULT_SCHEDULES,
  PATH_CREATE_SCHEDULE_TEMPLATE,
  PATH_STAFF_SCHEDULES,
} from '../../staff/menu/path'
import { staffMenu } from '../../staff/menu/staff'
import { userMenu } from '../../users/menu/user'
import {
  ScheduleOutlined,
  FileProtectOutlined,
  PlusCircleOutlined,
  FileSearchOutlined,
  SettingOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

export const administracion: AppMenuItem = {
  key: 'admin',
  label: 'Administración',
  requiredRols: [Rol.ADMIN],
  icon: React.createElement(SettingOutlined),
  children: [
    {
      ...staffMenu,
    },
    {
      key: 'schedules-submenu',
      label: 'Horarios',
      requiredRols: [Rol.ADMIN],
      icon: React.createElement(ScheduleOutlined),
      children: [
        {
          key: PATH_CONSULT_SCHEDULES,
          label: 'Consultar Horario',
          requiredRols: [Rol.ADMIN],
          icon: React.createElement(FileSearchOutlined),
        },
        {
          key: PATH_CREATE_SCHEDULE_TEMPLATE,
          label: 'Crear Horario',
          requiredRols: [Rol.ADMIN],
          icon: React.createElement(PlusCircleOutlined),
        },
        {
          key: PATH_STAFF_SCHEDULES,
          label: 'Horarios Asignados',
          requiredRols: [Rol.ADMIN],
          icon: React.createElement(CalendarOutlined),
        },
        {
          key: PATH_ASSIGN_SCHEDULE,
          label: 'Asignar Horario',
          requiredRols: [Rol.ADMIN],
          icon: React.createElement(FileProtectOutlined),
        },
      ],
    },
    {
      ...userMenu,
    },
    {
      ...insuranceMenu,
    },
  ],
}
