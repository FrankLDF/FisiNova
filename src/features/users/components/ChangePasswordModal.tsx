// src/features/users/components/ChangePasswordModal.tsx

import { Modal, Form, Space } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import { showHandleError } from '../../../utils/handleError'
import userService from '../services/user'
import type { ChangePasswordRequest } from '../models/user'

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
  forced?: boolean
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
  forced = false,
}) => {
  const [form] = Form.useForm()

  const { mutate: changePassword, isPending } = useCustomMutation({
    execute: userService.changePassword,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Contraseña cambiada exitosamente',
      })
      form.resetFields()
      onClose()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleSubmit = (values: ChangePasswordRequest) => {
    changePassword(values)
  }

  return (
    <Modal
      title={
        <Space>
          <LockOutlined />
          {forced ? 'Cambio de Contraseña Obligatorio' : 'Cambiar Contraseña'}
        </Space>
      }
      open={open}
      onCancel={forced ? undefined : onClose}
      footer={null}
      closable={!forced}
      maskClosable={!forced}
    >
      {forced && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd666',
            borderRadius: '6px',
          }}
        >
          <p style={{ margin: 0, color: '#d46b08' }}>
            Por seguridad, debes cambiar tu contraseña antes de continuar.
          </p>
        </div>
      )}

      <CustomForm form={form} layout="vertical" onFinish={handleSubmit}>
        <CustomFormItem
          label="Contraseña Actual"
          name="current_password"
          required
        >
          <CustomInput.Password
            placeholder="Ingresa tu contraseña actual"
            size="large"
          />
        </CustomFormItem>

        <CustomFormItem
          label="Nueva Contraseña"
          name="new_password"
          required
          rules={[
            {
              min: 6,
              message: 'La contraseña debe tener al menos 6 caracteres',
            },
          ]}
        >
          <CustomInput.Password
            placeholder="Ingresa tu nueva contraseña"
            size="large"
          />
        </CustomFormItem>

        <CustomFormItem
          label="Confirmar Nueva Contraseña"
          name="new_password_confirmation"
          required
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Las contraseñas no coinciden'))
              },
            }),
          ]}
        >
          <CustomInput.Password
            placeholder="Confirma tu nueva contraseña"
            size="large"
          />
        </CustomFormItem>

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {!forced && (
            <CustomButton onClick={onClose} disabled={isPending}>
              Cancelar
            </CustomButton>
          )}
          <CustomButton
            type="primary"
            htmlType="submit"
            loading={isPending}
            icon={<LockOutlined />}
          >
            Cambiar Contraseña
          </CustomButton>
        </Space>
      </CustomForm>
    </Modal>
  )
}
