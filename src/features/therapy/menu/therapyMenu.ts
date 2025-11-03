import { Rol, type AppMenuItem } from '../../../utils/constants'

export const therapyMenu: AppMenuItem = {
  key: '/therapist-dashboard',
  label: 'Mis Terapias',
  requiredRols: [Rol.ADMIN, Rol.THERAPIST],
}