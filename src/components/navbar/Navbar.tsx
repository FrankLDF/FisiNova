import { Menu } from 'antd'
import { administracion } from '../../features/administrator/menu/administration'
import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { patient } from '../../features/patient/menu/patient'
import { filterMenuItemsByRole } from '../../utils/filterMenuByRol'
import type { AppMenuItem } from '../../utils/constants'
import { appointment } from '../../features/appointment/menu/appointment'
import { useAuth } from '../../store/auth/AuthContext'
import { consultationMenu } from '../../features/consultation/menu/consultation'
import { therapyMenu } from '../../features/therapy/menu/therapyMenu'
import { reportsMenu } from '../../features/Reports/menu/reportsMenu'

export const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userRoles = user?.rols || []

  const handleClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  const items: AppMenuItem[] = [
    administracion,
    patient,
    appointment,
    consultationMenu,
    therapyMenu,
    reportsMenu
  ]
  const filteredItems: AppMenuItem[] = filterMenuItemsByRole(
    items as never,
    userRoles
  )

  return (
    <>
      <style>{`
        .wrap-menu .ant-menu-title-content{
          white-space: normal !important;
          word-break: break-word;
          overflow: visible !important;
          text-overflow: clip !important;
          line-height: 1.35;
        }
        .wrap-menu .ant-menu-item,
        .wrap-menu .ant-menu-submenu-title{
          height: auto !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
      `}</style>

      <Menu
        mode="inline"
        rootClassName="wrap-menu"
        style={{ width: '100%' }}
        items={filteredItems}
        onClick={handleClick}
      />
    </>
  )
}
