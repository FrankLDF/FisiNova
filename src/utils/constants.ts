import type { ItemType } from 'antd/es/menu/interface'

export const myPrimaryColor = import.meta.env.VITE_PRIMARY_COLOR || '#1691f5ff'

export const Rol = {
  ADMIN: 1,      // admin
  MEDIC: 2,      // medic
  THERAPIST: 3,  // therapist
}

export type AppMenuItem = ItemType & {
  requiredRols?: number[]
  children?: AppMenuItem[]
}
