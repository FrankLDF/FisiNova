import { Rol, type AppMenuItem } from '../../../utils/constants'

export const therapyMenu: AppMenuItem = {
  key: '/therapist-dashboard',
  label: 'Terapias',
  requiredRols: [Rol.ADMIN, Rol.THERAPIST],
  icon: ''
}