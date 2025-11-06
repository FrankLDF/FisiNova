import { Rol, type AppMenuItem } from '../../../utils/constants'

export const patient: AppMenuItem = {
  key: '/consult-patients',
  label: 'Pacientes',
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
}
