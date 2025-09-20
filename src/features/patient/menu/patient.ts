import { Rol, type AppMenuItem } from '../../../utils/constants'

export const patient: AppMenuItem = {
  key: 'Patient',
  label: 'Pacientes',
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
  children: [
    {
      key: 'consult-patients',
      label: 'Consultar pacientes',
      requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
    },
  ],
}