// src/features/therapy/components/TherapySessionModal.tsx
import { Modal, Form, Steps, Card, Space, Tag, Checkbox, Row, Col, Alert, Divider, InputNumber, Descriptions, Select } from 'antd'
import { useState, useEffect } from 'react'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/input/CustomInput'
import { CustomButton } from '../../../components/Button/CustomButton'
import { 
  PlayCircleOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  HeartOutlined 
} from '@ant-design/icons'
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

export const TherapySessionModal = ({ open, onClose, onSuccess, therapy }: Props) => {
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [therapyRecord, setTherapyRecord] = useState<any>(null)
  const [consultationInfo, setConsultationInfo] = useState<any>(null)
  const [selectedProcedures, setSelectedProcedures] = useState<number[]>([])
  const [insuranceAmount, setInsuranceAmount] = useState(0)
  const [patientAmount, setPatientAmount] = useState(0)

  useEffect(() => {
    if (open && therapy) {
      loadConsultationInfo()
      determineStep()
    }
  }, [open, therapy])

  const loadConsultationInfo = async () => {
    try {
      const response = await therapyService.getConsultationInfo(therapy.id)
      setConsultationInfo(response.data)
    } catch (error) {
      console.error('Error cargando info de consulta:', error)
    }
  }

  const determineStep = () => {
    const record = therapy?.therapy_record

    if (!record || !record.started_at) {
      setCurrentStep(0)
      form.resetFields()
    } else if (!record.is_authorized) {
      setCurrentStep(1)
      setTherapyRecord(record)
    } else if (!record.completed) {
      setCurrentStep(2)
      setTherapyRecord(record)
    } else {
      setCurrentStep(3)
      setTherapyRecord(record)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setCurrentStep(0)
    setTherapyRecord(null)
    setConsultationInfo(null)
    setSelectedProcedures([])
    onClose()
  }

  // ========== PASO 1: INICIAR SESIÓN ==========
  const handleStartSession = async () => {
    try {
      const values = await form.validateFields(['initial_patient_state', 'initial_observations'])
      setLoading(true)

      const response = await therapyService.startSession(therapy.id, {
        initial_patient_state: values.initial_patient_state,
        initial_observations: values.initial_observations,
      })

      setTherapyRecord(response.data.therapy_record)
      setCurrentStep(1)

      showNotification({
        type: 'success',
        message: 'Sesión iniciada exitosamente',
      })
    } catch (error: any) {
      if (error.errorFields) return
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  // ========== PASO 2: AUTORIZAR Y COBRAR ==========
  const handleAuthorizeSession = async () => {
    try {
      const values = await form.validateFields([
        'authorization_number',
        'authorization_date',
      ])

      if (selectedProcedures.length === 0) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar al menos un procedimiento',
        })
        return
      }

      if (insuranceAmount <= 0 && patientAmount <= 0) {
        showNotification({
          type: 'error',
          message: 'Debe ingresar al menos un monto (seguro o paciente)',
        })
        return
      }

      setLoading(true)

      const response = await therapyService.authorizeSession(therapy.id, {
        authorization_number: values.authorization_number,
        authorization_date: values.authorization_date || dayjs().format('YYYY-MM-DD'),
        insurance_amount: insuranceAmount,
        patient_amount: patientAmount,
        selected_procedure_detail_ids: selectedProcedures,
      })

      setTherapyRecord(response.data)
      setCurrentStep(2)

      showNotification({
        type: 'success',
        message: 'Sesión autorizada y cobrada exitosamente',
      })
    } catch (error: any) {
      if (error.errorFields) return
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  // ========== PASO 3: COMPLETAR SESIÓN ==========
  const handleCompleteSession = async () => {
    try {
      const values = await form.validateFields([
        'procedure_notes',
        'final_patient_state',
        'final_observations',
        'next_session_recommendation',
        'intensity',
      ])

      setLoading(true)

      await therapyService.completeSession(therapy.id, {
        procedure_notes: values.procedure_notes,
        final_patient_state: values.final_patient_state,
        final_observations: values.final_observations,
        next_session_recommendation: values.next_session_recommendation,
        intensity: values.intensity,
      })

      showNotification({
        type: 'success',
        message: 'Sesión completada exitosamente',
      })

      onSuccess()
      handleClose()
    } catch (error: any) {
      if (error.errorFields) return
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  const renderDiagnostics = () => {
    if (!consultationInfo?.diagnostics || consultationInfo.diagnostics.length === 0) {
      return <Alert message="No hay diagnósticos registrados" type="info" showIcon />
    }

    return (
      <Card 
        size="small" 
        title={
          <Space>
            <MedicineBoxOutlined />
            <span>Diagnósticos del Médico</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          {consultationInfo.diagnostics.map((item: any) => (
            <Tag key={item.id} color="red" style={{ fontSize: 13, padding: '4px 12px' }}>
              <strong>{item.diagnostic?.code}:</strong> {item.diagnostic?.description}
            </Tag>
          ))}
        </Space>
      </Card>
    )
  }

  const renderProcedureSelection = () => {
    if (!consultationInfo?.procedure_details || consultationInfo.procedure_details.length === 0) {
      return (
        <Alert 
          message="No hay procedimientos indicados en la consulta" 
          type="warning" 
          showIcon 
        />
      )
    }

    return (
      <Card
        size="small"
        title={
          <Space>
            <FileTextOutlined />
            <span>Seleccione los Procedimientos Realizados</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Checkbox.Group
          value={selectedProcedures}
          onChange={setSelectedProcedures}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {consultationInfo.procedure_details.map((detail: any) => (
              <Card key={detail.id} size="small" style={{ background: '#f9f9f9' }}>
                <Checkbox value={detail.id}>
                  <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 500 }}>
                      {detail.procedure_standard?.standard || 'N/A'} - {detail.procedure_standard?.description}
                    </span>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      Sesiones: {detail.sessions_completed}/{detail.sessions_authorized} | 
                      Estado: <Tag color="blue">{detail.status}</Tag>
                    </span>
                  </Space>
                </Checkbox>
              </Card>
            ))}
          </Space>
        </Checkbox.Group>
      </Card>
    )
  }

  const renderStep1 = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Inicio de Sesión de Terapia"
        description="Registre el estado inicial del paciente antes de comenzar la sesión"
        type="info"
        showIcon
        icon={<PlayCircleOutlined />}
      />

      <Card>
        <CustomFormItem
          label="Estado Inicial del Paciente"
          name="initial_patient_state"
          required
          tooltip="Descripción del estado físico y emocional del paciente al iniciar"
        >
          <TextArea
            rows={4}
            placeholder="Ej: Paciente presenta dolor lumbar moderado, movilidad reducida..."
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
            placeholder="Ej: Paciente indica mejoría desde última sesión..."
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
  )

  const renderStep2 = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Autorización y Cobro de Sesión"
        description="Seleccione los procedimientos realizados y registre los montos de cobro"
        type="warning"
        showIcon
        icon={<DollarOutlined />}
      />

      {renderDiagnostics()}
      {renderProcedureSelection()}

      <Card 
        title={
          <Space>
            <DollarOutlined />
            <span>Información de Cobro</span>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <CustomFormItem
              label="Número de Autorización"
              name="authorization_number"
              required
            >
              <CustomInput placeholder="Ej: AUTH-2025-001" />
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem
              label="Fecha de Autorización"
              name="authorization_date"
            >
              <CustomInput 
                type="date" 
                defaultValue={dayjs().format('YYYY-MM-DD')}
              />
            </CustomFormItem>
          </Col>
        </Row>

        <Divider>Montos de Cobro</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <CustomFormItem
              label="Monto Cubierto por Seguro"
              tooltip="Monto que pagará el seguro"
            >
              <InputNumber
                value={insuranceAmount}
                onChange={(val) => setInsuranceAmount(val || 0)}
                min={0}
                step={0.01}
                precision={2}
                prefix="$"
                style={{ width: '100%' }}
                placeholder="0.00"
              />
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem
              label="Copago del Paciente"
              tooltip="Monto que pagará el paciente"
            >
              <InputNumber
                value={patientAmount}
                onChange={(val) => setPatientAmount(val || 0)}
                min={0}
                step={0.01}
                precision={2}
                prefix="$"
                style={{ width: '100%' }}
                placeholder="0.00"
              />
            </CustomFormItem>
          </Col>
        </Row>

        <Card size="small" style={{ background: '#e6f7ff', marginTop: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item 
              label={<strong>Total a Cobrar</strong>}
              labelStyle={{ width: '50%' }}
            >
              <strong style={{ fontSize: 18, color: '#1890ff' }}>
                ${(insuranceAmount + patientAmount).toFixed(2)}
              </strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Card>

      <CustomButton
        type="primary"
        size="large"
        icon={<DollarOutlined />}
        onClick={handleAuthorizeSession}
        loading={loading}
        block
      >
        Autorizar y Registrar Cobro
      </CustomButton>
    </Space>
  )

  const renderStep3 = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Finalización de Sesión"
        description="Complete el registro con las observaciones finales del paciente"
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
      />

      {therapyRecord?.is_authorized && (
        <Card size="small" style={{ background: '#f6ffed' }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Autorización">
              {therapyRecord.authorization_number}
            </Descriptions.Item>
            <Descriptions.Item label="Total Cobrado">
              <strong>${therapyRecord.total_amount}</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card>
        <CustomFormItem
          label="Notas de Procedimientos Realizados"
          name="procedure_notes"
        >
          <TextArea
            rows={3}
            placeholder="Descripción detallada de los procedimientos aplicados..."
            maxLength={2000}
          />
        </CustomFormItem>

        <CustomFormItem
          label="Estado Final del Paciente"
          name="final_patient_state"
          required
        >
          <TextArea
            rows={4}
            placeholder="Ej: Paciente reporta disminución del dolor, mejor rango de movimiento..."
            maxLength={500}
          />
        </CustomFormItem>

        <CustomFormItem
          label="Observaciones Finales"
          name="final_observations"
        >
          <TextArea
            rows={3}
            placeholder="Información adicional sobre la evolución..."
            maxLength={2000}
          />
        </CustomFormItem>

        <CustomFormItem
          label="Recomendaciones para Próxima Sesión"
          name="next_session_recommendation"
        >
          <TextArea
            rows={2}
            placeholder="Ej: Continuar con ejercicios de fortalecimiento..."
            maxLength={1000}
          />
        </CustomFormItem>

        <CustomFormItem
          label="Intensidad de la Sesión"
          name="intensity"
        >
          <Select placeholder="Seleccionar intensidad" size="large">
            <Select.Option value="low">
              <Tag color="green">Baja</Tag>
            </Select.Option>
            <Select.Option value="moderate">
              <Tag color="orange">Moderada</Tag>
            </Select.Option>
            <Select.Option value="high">
              <Tag color="red">Alta</Tag>
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
  )

  const renderCompletedView = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Sesión Completada"
        description="Esta sesión ya fue completada exitosamente"
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
      />

      {therapyRecord && (
        <Card title="Resumen de la Sesión">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Duración">
              {therapyRecord.duration_minutes} minutos
            </Descriptions.Item>
            <Descriptions.Item label="Autorización">
              {therapyRecord.authorization_number}
            </Descriptions.Item>
            <Descriptions.Item label="Total Cobrado">
              <strong>${therapyRecord.total_amount}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Estado Final">
              {therapyRecord.final_patient_state}
            </Descriptions.Item>
            {therapyRecord.intensity && (
              <Descriptions.Item label="Intensidad">
                <Tag color={
                  therapyRecord.intensity === 'low' ? 'green' :
                  therapyRecord.intensity === 'moderate' ? 'orange' : 'red'
                }>
                  {therapyRecord.intensity === 'low' ? 'Baja' :
                   therapyRecord.intensity === 'moderate' ? 'Moderada' : 'Alta'}
                </Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}
    </Space>
  )

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined />
          <span>Sesión de Terapia - {therapy?.patient?.firstname} {therapy?.patient?.lastname}</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
          items={[
            {
              title: 'Iniciar',
              icon: <PlayCircleOutlined />,
            },
            {
              title: 'Autorizar',
              icon: <DollarOutlined />,
            },
            {
              title: 'Completar',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />

        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}
        {currentStep === 3 && renderCompletedView()}
      </Form>
    </Modal>
  )
}