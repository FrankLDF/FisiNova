// src/features/insurances/menu/insurance.ts

import { Rol, type AppMenuItem } from '../../../utils/constants'

export const insuranceMenu: AppMenuItem = {
  key: 'insurances-management',
  label: 'Seguros Médicos',
  requiredRols: [Rol.ADMIN, Rol.SECRETARY],
  children: [
    {
      key: '/consult-insurances',
      label: 'Consultar Seguros',
      requiredRols: [Rol.ADMIN, Rol.SECRETARY],
    },
    {
      key: '/create-insurance',
      label: 'Crear Seguro',
      requiredRols: [Rol.ADMIN],
    },
  ],
}

// src/features/insurances/menu/path.ts

export const PATH_CONSULT_INSURANCES = '/consult-insurances'
export const PATH_CREATE_INSURANCE = '/create-insurance'
export const PATH_INSURANCE_DETAIL = '/insurances/:id'
export const PATH_EDIT_INSURANCE = '/insurances/:id/edit'
