import { Rol, type AppMenuItem } from '../../../utils/constants'
import { staffMenu } from '../../staff/menu/staff'
import { userMenu } from '../../users/menu/user'

export const administracion: AppMenuItem = {
  key: 'admin',
  label: 'Administración',
  requiredRols: [Rol.ADMIN],
  children: [
    {
      ...staffMenu,
    },
    {
      ...userMenu,
    },
  ],
}
