import { Modal, Form, Card, Space, Alert, Select, Tag, Descriptions, Divider } from 'antd'
import { useState, useEffect } from 'react'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/input/CustomInput'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CheckCircleOutlined, HeartOutlined, ClockCircleOutlined } from '@ant-design/icons'
import therapyService from '../services/therapy'
import { showNotification } from '../../../utils/showNotification'
import { showHandleError } from '../../../utils/handleError'
import dayjs from 'dayjs'

const { TextArea } = CustomInput

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  therapy: any
}

export const CompleteTherapySessionModal = ({ open, onClose, onSuccess, therapy }: Props) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && therapy) {
      form.resetFields()
    }
  }, [open, therapy, form])

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const handleCompleteSession = async () => {
    try {
      const values = await form.validateFields([
        'final_patient_state',
        'final_observations',
        'next_session_recommendation',
        'intensity',
      ])

      setLoading(true)

      await therapyService.completeSession(therapy.id, {
        final_patient_state: values.final_patient_state,
        final_observations: values.final_observations,
        next_session_recommendation: values.next_session_recommendation,
        intensity: values.intensity,
      })

      showNotification({
        type: 'success',
        message: 'Sesión completada exitosamente',
      })

      form.resetFields()
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errorFields) return
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  const renderSessionInfo = () => {
    if (!therapy) return null

    const therapyRecord = therapy.therapy_record
    const startTime = therapyRecord?.started_at
      ? dayjs(therapyRecord.started_at).format('HH:mm')
      : 'N/A'

    const duration = therapyRecord?.started_at
      ? dayjs().diff(dayjs(therapyRecord.started_at), 'minute')
      : 0

    return (
      <Card size="small" style={{ marginBottom: 16, background: '#f6ffed' }}>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Paciente" span={2}>
            <strong>
              {therapy.patient?.firstname} {therapy.patient?.lastname}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Sesión">
            <Tag color="purple">
              {therapy.session_number}/{therapy.total_sessions}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Hora de Inicio">
            <Tag color="blue" icon={<ClockCircleOutlined />}>
              {startTime}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Duración Aproximada" span={2}>
            <strong>{duration} minutos</strong>
          </Descriptions.Item>
          {therapyRecord?.initial_patient_state && (
            <Descriptions.Item label="Estado Inicial" span={2}>
              {therapyRecord.initial_patient_state}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined style={{ color: '#52c41a' }} />
          <span>Finalizar Sesión de Terapia</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Finalización de Sesión"
            description="Complete el registro con las observaciones finales del paciente"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />

          {renderSessionInfo()}

          <Divider orientation="left">Observaciones Finales</Divider>

          <Card>
            <CustomFormItem
              label="Estado Final del Paciente"
              name="final_patient_state"
              required
              tooltip="Descripción del estado físico y emocional del paciente al finalizar"
            >
              <TextArea
                rows={4}
                placeholder="Ej: Paciente reporta disminución del dolor, mejor rango de movimiento, movilidad mejorada..."
                maxLength={500}
              />
            </CustomFormItem>

            <CustomFormItem
              label="Observaciones Finales"
              name="final_observations"
              tooltip="Información adicional sobre la evolución"
            >
              <TextArea
                rows={3}
                placeholder="Información adicional sobre la evolución del paciente durante la sesión..."
                maxLength={2000}
              />
            </CustomFormItem>

            <CustomFormItem
              label="Recomendaciones para Próxima Sesión"
              name="next_session_recommendation"
              tooltip="Sugerencias para la siguiente sesión de terapia"
            >
              <TextArea
                rows={2}
                placeholder="Ej: Continuar con ejercicios de fortalecimiento, aumentar intensidad gradualmente..."
                maxLength={1000}
              />
            </CustomFormItem>

            <CustomFormItem
              label="Intensidad de la Sesión"
              name="intensity"
              tooltip="Nivel de intensidad de la sesión realizada"
            >
              <Select placeholder="Seleccionar intensidad" size="large">
                <Select.Option value="low">
                  <Tag color="green">Baja</Tag> - Sesión suave, sin esfuerzo significativo
                </Select.Option>
                <Select.Option value="moderate">
                  <Tag color="orange">Moderada</Tag> - Sesión regular con esfuerzo controlado
                </Select.Option>
                <Select.Option value="high">
                  <Tag color="red">Alta</Tag> - Sesión intensa con esfuerzo considerable
                </Select.Option>
              </Select>
            </CustomFormItem>
          </Card>

          <CustomButton
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleCompleteSession}
            loading={loading}
            block
          >
            Finalizar Sesión
          </CustomButton>
        </Space>
      </Form>
    </Modal>
  )
}
