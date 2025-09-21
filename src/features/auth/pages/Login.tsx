import { useNavigate } from 'react-router-dom'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/input/CustomInput'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { PATH_MAIN } from '../../../routes/pathts'
import { showNotification } from '../../../utils/showNotification'
import { LoginShell } from '../components/LoginShell'
import auth from '../services/auth'
import { useAuth } from '../../../store/auth/AuthContext'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { mutate: loginUser, isPending } = useCustomMutation({
    execute: auth.login,
    onSuccess: (response) => {
      if (response && response.token && response.data) {
        login(response.data, response.token)
        navigate(PATH_MAIN, { replace: true })
      } else {
        showNotification({
          type: 'error',
          message: 'Respuesta inválida del servidor',
        })
      }
    },
    onError: (err) => {
      showNotification({
        type: 'error',
        message: `${err.response.message}`,
      })
    },
  })
  return (
    <LoginShell
      logo={
        <img
          src="/Logo-white.png"
          alt="Logo empresa"
          style={{ maxWidth: 300 }}
        />
      }
      form={
        <CustomForm layout="vertical" onFinish={loginUser}>
          <CustomFormItem label="Usuario" name="name" required>
            <CustomInput size="large" />
          </CustomFormItem>

          <CustomFormItem label="Contraseña" name="password" required>
            <CustomInput.Password size="large" />
          </CustomFormItem>

          <CustomButton
            loading={isPending}
            type="primary"
            htmlType="submit"
            block
          >
            Iniciar sesión
          </CustomButton>
        </CustomForm>
      }
    />
  )
}
