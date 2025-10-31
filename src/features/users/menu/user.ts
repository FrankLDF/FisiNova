// src/features/users/menu/user.ts

import { Rol, type AppMenuItem } from '../../../utils/constants'

export const userMenu: AppMenuItem = {
  key: 'users-management',
  label: 'Usuarios',
  requiredRols: [Rol.ADMIN],
  children: [
    {
      key: '/consult-users',
      label: 'Consultar Usuarios',
      requiredRols: [Rol.ADMIN],
    },
    {
      key: '/create-user',
      label: 'Crear Usuario',
      requiredRols: [Rol.ADMIN],
    },
  ],
}

// src/features/users/menu/path.ts

export const PATH_CONSULT_USERS = '/consult-users'
export const PATH_CREATE_USER = '/create-user'
export const PATH_USER_DETAIL = '/users/:id'
export const PATH_EDIT_USER = '/users/:id/edit'
