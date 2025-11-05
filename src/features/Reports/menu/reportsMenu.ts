import { Rol, type AppMenuItem } from '../../../utils/constants'

export const reportsMenu: AppMenuItem = {
  key: '/reports-dashboard',
  label: 'Reportes',
  requiredRols: [Rol.ADMIN, Rol.SECRETARY],
  icon: ''
}