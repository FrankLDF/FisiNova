import { Rol, type AppMenuItem } from '../../../utils/constants'
import { PATH_REGISTER_PERSONAL } from './path'

export const administracion: AppMenuItem = {
  key: 'admin',
  label: 'Administración',
  requiredRols: [Rol.ADMIN],
  children: [
    {
      key: 'rols',
      label: 'Roles',
      requiredRols: [Rol.ADMIN],
    },
    {
      key: 'personal',
      label: 'Personal',
      requiredRols: [Rol.ADMIN],
      children: [
        {
          key: PATH_REGISTER_PERSONAL,
          label: 'Crear Personal',
          requiredRols: [Rol.ADMIN],
        },
      ],
    },
  ],
}