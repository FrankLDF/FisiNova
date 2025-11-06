// src/features/staff/menu/staff.ts

import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import { PATH_CONSULT_STAFF, PATH_CREATE_STAFF } from './path'
import {
  FileSearchOutlined,
  IdcardOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
export const staffMenu: AppMenuItem = {
  key: 'staff-management',
  label: 'Personal',
  requiredRols: [Rol.ADMIN],
  icon: React.createElement(IdcardOutlined),
  children: [
    {
      key: PATH_CONSULT_STAFF,
      label: 'Consultar Personal',
      requiredRols: [Rol.ADMIN],
      icon: React.createElement(FileSearchOutlined),
    },
    {
      key: PATH_CREATE_STAFF,
      label: 'Crear Personal',
      requiredRols: [Rol.ADMIN],
      icon: React.createElement(PlusCircleOutlined),
    },
  ],
}
