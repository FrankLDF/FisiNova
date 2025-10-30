import { Layout, Grid, Drawer } from 'antd'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { CustomButton } from '../components/Button/CustomButton'
import { myPrimaryColor } from '../utils/constants'
import { ChangePasswordModal } from '../features/users/components/ChangePasswordModal'
import { usePasswordResetCheck } from '../features/users/hooks/usePasswordResetCheck'

const { Header, Sider, Content } = Layout
const { useBreakpoint } = Grid

interface AppShellProps {
  headerContent: ReactNode
  navContent: ReactNode
  children: ReactNode
}

export const AppShell = ({
  headerContent,
  navContent,
  children,
}: AppShellProps) => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const { showPasswordResetModal, closePasswordResetModal } =
    usePasswordResetCheck()

  useEffect(() => {
    setIsNavCollapsed(isMobile)
  }, [isMobile])

  const toggleNav = () => {
    setIsNavCollapsed((prev) => !prev)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          height: 64,
          paddingInline: 16,
          background: `${myPrimaryColor}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          width: '100%',
          zIndex: 1001,
        }}
      >
        <CustomButton
          icon={isNavCollapsed ? <MenuOutlined /> : <CloseOutlined />}
          onClick={toggleNav}
          style={{ marginRight: 16 }}
          type="text"
        />

        <div style={{ flex: 1 }}>{headerContent}</div>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        {!isMobile && !isNavCollapsed && (
          <Sider
            width={220}
            style={{
              background: '#fff',
              borderRight: '1px solid #f0f0f0',
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
            }}
          >
            {navContent}
          </Sider>
        )}

        {isMobile && (
          <Drawer
            placement="left"
            open={!isNavCollapsed}
            onClose={toggleNav}
            bodyStyle={{ padding: 0 }}
            width={250}
          >
            {navContent}
          </Drawer>
        )}

        <Layout>
          <Content
            style={{
              padding: 24,
              background: '#f5f5f5',
              minHeight: 'calc(100vh - 64px)',
              maxHeight: 'calc(100vh - 64px)',
              transition: 'margin-left 0.2s',
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      {/* Modal de cambio de contraseña obligatorio */}
      <ChangePasswordModal
        open={showPasswordResetModal}
        onClose={closePasswordResetModal}
        forced={true}
      />
    </Layout>
  )
}
