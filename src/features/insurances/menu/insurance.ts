// src/features/insurances/menu/insurance.ts

import React from 'react'
import { Rol, type AppMenuItem } from '../../../utils/constants'
import {
  FileProtectOutlined,
  FileSearchOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'

export const insuranceMenu: AppMenuItem = {
  key: 'insurances-management',
  label: 'Seguros Médicos',
  requiredRols: [Rol.ADMIN, Rol.SECRETARY],
  icon: React.createElement(FileProtectOutlined),
  children: [
    {
      key: '/consult-insurances',
      label: 'Consultar Seguros',
      requiredRols: [Rol.ADMIN, Rol.SECRETARY],
      icon: React.createElement(FileSearchOutlined),
    },
    {
      key: '/create-insurance',
      label: 'Crear Seguro',
      requiredRols: [Rol.ADMIN],
      icon: React.createElement(PlusCircleOutlined),
    },
  ],
}

// src/features/insurances/menu/path.ts

export const PATH_CONSULT_INSURANCES = '/consult-insurances'
export const PATH_CREATE_INSURANCE = '/create-insurance'
export const PATH_INSURANCE_DETAIL = '/insurances/:id'
export const PATH_EDIT_INSURANCE = '/insurances/:id/edit'
