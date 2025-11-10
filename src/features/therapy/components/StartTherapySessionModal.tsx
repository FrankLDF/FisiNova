import { Modal, Form, Card, Space, Alert, Tag, Descriptions, Divider, Empty } from 'antd'
import { useState, useEffect } from 'react'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/input/CustomInput'
import { CustomButton } from '../../../components/Button/CustomButton'
import {
  PlayCircleOutlined,
  HeartOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import therapyService from '../services/therapy'
import { showNotification } from '../../../utils/showNotification'
import { showHandleError } from '../../../utils/handleError'

const { TextArea } = CustomInput

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  therapy: any
}

export const StartTherapySessionModal = ({ open, onClose, onSuccess, therapy }: Props) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [consultationInfo, setConsultationInfo] = useState<any>(null)

  useEffect(() => {
    if (open && therapy?.id) {
      loadConsultationInfo()
    }
  }, [open, therapy])

  const loadConsultationInfo = async () => {
    try {
      // La información ya viene en therapy desde el dashboard
      const procedure = therapy?.consultation_procedure

      setConsultationInfo({
        diagnostics: procedure?.procedure_diagnostics || [],
        procedure_details: procedure?.procedure_details || [],
      })
    } catch (error) {
      console.error('Error cargando info de consulta:', error)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setConsultationInfo(null)
    onClose()
  }

  const handleStartSession = async () => {
    try {
      const values = await form.validateFields(['initial_patient_state', 'initial_observations'])
      setLoading(true)

      await therapyService.startSession(therapy.id, {
        initial_patient_state: values.initial_patient_state,
        initial_observations: values.initial_observations,
      })

      showNotification({
        type: 'success',
        message: 'Sesión iniciada exitosamente',
      })

      form.resetFields()
      setConsultationInfo(null)
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errorFields) return
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  const renderPatientInfo = () => {
    const patient = therapy?.patient
    if (!patient) return null

    return (
      <Card
        size="small"
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>Información del Paciente</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Nombre" span={2}>
            <strong>
              {patient.firstname} {patient.lastname}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="DNI">{patient.dni || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Edad">
            {patient.age ? `${patient.age} años` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Sexo">
            {patient.sex === 'M' ? 'Masculino' : patient.sex === 'F' ? 'Femenino' : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Teléfono">{patient.phone || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>
    )
  }

  const renderDiagnostics = () => {
    if (!consultationInfo?.diagnostics || consultationInfo.diagnostics.length === 0) {
      return (
        <Card
          size="small"
          title={
            <Space>
              <MedicineBoxOutlined style={{ color: '#ff4d4f' }} />
              <span>Diagnósticos</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Empty
            description="No hay diagnósticos registrados"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )
    }

    return (
      <Card
        size="small"
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#ff4d4f' }} />
            <span>Diagnósticos del Médico</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          {consultationInfo.diagnostics.map((item: any) => (
            <Tag
              key={item.id}
              color="red"
              style={{ fontSize: 13, padding: '4px 12px', marginBottom: 8 }}
            >
              <strong>{item.diagnostic?.code}:</strong> {item.diagnostic?.description}
            </Tag>
          ))}
        </Space>
      </Card>
    )
  }

  const renderProcedures = () => {
    if (!consultationInfo?.procedure_details || consultationInfo.procedure_details.length === 0) {
      return (
        <Card
          size="small"
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <span>Procedimientos</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Empty
            description="No hay procedimientos indicados"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )
    }

    return (
      <Card
        size="small"
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Procedimientos Indicados</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {consultationInfo.procedure_details.map((detail: any) => (
            <Card key={detail.id} size="small" style={{ background: '#f0f5ff' }}>
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {detail.procedure_standard?.standard || 'N/A'} -{' '}
                  {detail.procedure_standard?.description}
                </div>
              </Space>
            </Card>
          ))}
        </Space>
      </Card>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined style={{ color: '#1890ff' }} />
          <span>Iniciar Sesión de Terapia</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Inicio de Sesión de Terapia"
            description="Revise la información del paciente y registre el estado inicial antes de comenzar la sesión"
            type="info"
            showIcon
            icon={<PlayCircleOutlined />}
          />

          {renderPatientInfo()}

          <Divider orientation="left">Información de la Consulta</Divider>

          {renderDiagnostics()}
          {renderProcedures()}

          <Divider orientation="left">Estado Inicial del Paciente</Divider>

          <Card>
            <CustomFormItem
              label="Estado Inicial del Paciente"
              name="initial_patient_state"
              required
              tooltip="Descripción del estado físico y emocional del paciente al iniciar"
            >
              <TextArea
                rows={4}
                placeholder="Ej: Paciente presenta dolor lumbar moderado, movilidad reducida, tensión muscular en zona lumbar..."
                maxLength={500}
              />
            </CustomFormItem>

            <CustomFormItem
              label="Observaciones Iniciales"
              name="initial_observations"
              tooltip="Información adicional relevante"
            >
              <TextArea
                rows={3}
                placeholder="Ej: Paciente indica mejoría desde última sesión, refiere haber realizado ejercicios en casa..."
                maxLength={2000}
              />
            </CustomFormItem>
          </Card>

          <CustomButton
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleStartSession}
            loading={loading}
            block
          >
            Iniciar Sesión
          </CustomButton>
        </Space>
      </Form>
    </Modal>
  )
}
