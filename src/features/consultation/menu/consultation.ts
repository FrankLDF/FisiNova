// Agregar al menu: src/features/consultation/menu/consultation.ts
import { Rol, type AppMenuItem } from '../../../utils/constants'

export const consultationMenu: AppMenuItem = {
  key: '/my-consultations',
  label: 'Mis Consultas',
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
}