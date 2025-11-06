// src/features/users/menu/user.ts

import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import {
  UserAddOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@ant-design/icons'
export const userMenu: AppMenuItem = {
  key: 'users-management',
  label: 'Usuarios',
  requiredRols: [Rol.ADMIN],
  icon: React.createElement(UserOutlined),
  children: [
    {
      key: '/consult-users',
      label: 'Consultar Usuarios',
      requiredRols: [Rol.ADMIN],
      icon: React.createElement(UsergroupAddOutlined),
    },
    {
      key: '/create-user',
      label: 'Crear Usuario',
      requiredRols: [Rol.ADMIN],
      icon: React.createElement(UserAddOutlined),
    },
  ],
}

// src/features/users/menu/path.ts

export const PATH_CONSULT_USERS = '/consult-users'
export const PATH_CREATE_USER = '/create-user'
export const PATH_USER_DETAIL = '/users/:id'
export const PATH_EDIT_USER = '/users/:id/edit'
