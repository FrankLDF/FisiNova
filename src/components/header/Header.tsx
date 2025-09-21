import {
  Avatar,
  Grid,
  Row,
  Col,
  Dropdown,
  type MenuProps,
  Typography,
  Tooltip,
} from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { CustomButton } from '../Button/CustomButton'
import { CustomConfirm } from '../pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../hooks/UseCustomMutation'
import auth from '../../features/auth/services/auth'
import { useAuth } from '../../store/auth/AuthContext'

const { Text } = Typography

function Header() {
  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const { user, logout } = useAuth()
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const { mutate: logoutUser, isPending } = useCustomMutation({
    execute: auth.logout,
    onSuccess: () => {
      logout(true)
    },
    onError: (err) => {
      console.error('Error en logout:', err)
      logout(true)
    },
  })

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'name',
      label: <Text strong>{user?.name || 'Usuario'}</Text>,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span onClick={() => logoutUser()}>Cerrar sesión</span>,
    },
  ]

  return (
    <Row justify="space-between" align="middle" style={{ height: '100%' }}>
      <Col>
        <img
          src={isMobile ? '/Logo-white.png' : '/logo-desktop.png'}
          alt="logo empresa"
          style={{
            height: '40px',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </Col>

      <Col>
        {isMobile ? (
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />}>
              {firstLetter}
            </Avatar>
          </Dropdown>
        ) : (
          <Row align="middle" gutter={8}>
            <Col>
              <Avatar>{firstLetter}</Avatar>
            </Col>
            <Col>
              <Text style={{ color: 'white' }} strong>
                {user?.name || 'Usuario'}
              </Text>
            </Col>
            <Col>
              <Tooltip title="Cerrar sesión">
                <CustomConfirm
                  title="¿Estás seguro que deseas cerrar sesión?"
                  onConfirm={() => logoutUser()}
                >
                  <CustomButton
                    loading={isPending}
                    size="large"
                    type="text"
                    icon={<LogoutOutlined />}
                    style={{
                      color: 'white',
                    }}
                  ></CustomButton>
                </CustomConfirm>
              </Tooltip>
            </Col>
          </Row>
        )}
      </Col>
    </Row>
  )
}

export default Header
