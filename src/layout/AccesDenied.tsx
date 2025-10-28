import { Result } from 'antd'
import { CustomButton } from '../components/Button/CustomButton'
import { useNavigate } from 'react-router-dom'
import { LockOutlined } from '@ant-design/icons'
import { PATH_MAIN } from '../routes/pathts'

export const AccessDenied = () => {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Result
        status="403"
        icon={<LockOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
        title="Acceso Denegado"
        subTitle="Lo sentimos, no tienes permisos para acceder a esta página."
        extra={
          <CustomButton type="primary" onClick={() => navigate(PATH_MAIN)}>
            Volver al Inicio
          </CustomButton>
        }
      />
    </div>
  )
}