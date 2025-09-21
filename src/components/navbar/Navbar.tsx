import { Menu } from 'antd'
import { administracion } from '../../features/administrator/menu/administration'
import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { patient } from '../../features/patient/menu/patient'
import { filterMenuItemsByRole } from '../../utils/filterMenuByRol'
import type { AppMenuItem } from '../../utils/constants'
import { appointment } from '../../features/appointment/menu/appointment'
import { useAuth } from '../../store/auth/AuthContext'

export const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userRoles = user?.rols || []

  const handleClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  const items: AppMenuItem[] = [administracion, patient, appointment]
  const filteredItems: AppMenuItem[] = filterMenuItemsByRole(
    items as never,
    userRoles
  )

  return (
    <Menu
      mode="inline"
      style={{ width: '100%' }}
      items={filteredItems}
      onClick={handleClick}
    />
  )
}
