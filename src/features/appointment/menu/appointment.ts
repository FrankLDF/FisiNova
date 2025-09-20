import { Rol, type AppMenuItem } from '../../../utils/constants'
import { 
  PATH_CONSULT_APPOINTMENTS, 
  PATH_CREATE_APPOINTMENT 
} from './path'

export const appointment: AppMenuItem = {
  key: "appointments",
  label: "Citas",
  requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
  children: [
    {
      key: PATH_CONSULT_APPOINTMENTS,
      label: "Consultar citas",
      requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
    },
    {
      key: PATH_CREATE_APPOINTMENT,
      label: "Crear cita",
      requiredRols: [Rol.ADMIN, Rol.MEDIC, Rol.THERAPIST],
    },
  ],
};