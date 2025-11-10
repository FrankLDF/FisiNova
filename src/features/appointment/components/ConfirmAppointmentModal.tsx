// ============================================================
// ARCHIVO: src/features/appointment/components/ConfirmAppointmentModal.tsx
// ============================================================
import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Radio,
  Space,
  Card,
  Divider,
  Typography,
  Alert,
  DatePicker,
  Row,
  Col,
  InputNumber,
} from 'antd'
import {
  CheckCircleOutlined,
  UserOutlined,
  SafetyOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomButton } from '../../../components/Button/CustomButton'
import { PatientSelectorModal } from '../../../components/modals/PatientSelectorModal'
import { QuickPatientRegister } from './QuickPatientRegister'
import type { Appointment } from '../models/appointment'
import type { Patient } from '../../patient/models/patient'
import type { ConfirmAppointmentRequest } from '../../authorization/models/authorization'
import dayjs from 'dayjs'

const { Title, Text } = Typography

type PaymentType = 'insurance' | 'private' | 'workplace_risk'

interface ConfirmAppointmentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: ConfirmAppointmentRequest) => void
  appointment: Appointment | null
  insurances: Array<{ id: number; name: string }>
  loading?: boolean
}

export const ConfirmAppointmentModal: React.FC<ConfirmAppointmentModalProps> = ({
  open,
  onClose,
  onConfirm,
  appointment,
  insurances,
  loading,
}) => {
  const [form] = Form.useForm()
  const [paymentType, setPaymentType] = useState<PaymentType>('insurance')
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [insuranceAmount, setInsuranceAmount] = useState(0)
  const [patientAmount, setPatientAmount] = useState(0)
  const totalAmount = insuranceAmount + patientAmount

  // Determinar si la cita es consulta o terapia
  const isTherapy = appointment?.type === 'therapy'
  const isConsultation = appointment?.type === 'consultation'

  // Determinar si requiere autorización previa y montos
  const requiresAuthorization = isTherapy && paymentType === 'insurance'
  const requiresAmounts = isTherapy && paymentType === 'insurance'

  useEffect(() => {
    if (appointment && open) {
      // Configurar paciente
      if (appointment.patient) {
        setSelectedPatient(appointment.patient as Patient)
      } else {
        setSelectedPatient(null)
      }

      // Configurar valores iniciales
      const initialPaymentType = appointment.payment_type || 'insurance'
      form.setFieldsValue({
        payment_type: initialPaymentType,
        insurance_id: Number(appointment.insurance_id || selectedPatient?.insurance_id || 0),
        case_number: appointment.case_number,
        insurance_code: appointment.insurance_code,
        authorization_date: dayjs(),
      })
      setPaymentType(initialPaymentType as PaymentType)

      // Resetear montos
      setInsuranceAmount(0)
      setPatientAmount(0)
    }
  }, [appointment, open, form, selectedPatient])

  const handlePaymentTypeChange = (e: any) => {
    const value = e.target.value as PaymentType
    setPaymentType(value)

    // Limpiar campos según el tipo de pago
    if (value === 'private') {
      form.setFieldsValue({
        authorization_number: null,
        insurance_id: null,
        insurance_code: null,
        authorization_date: null,
        case_number: null,
      })
      setInsuranceAmount(0)
      setPatientAmount(0)
    } else if (value === 'workplace_risk') {
      form.setFieldsValue({
        authorization_number: null,
        insurance_id: null,
        insurance_code: null,
        authorization_date: null,
      })
      setInsuranceAmount(0)
      setPatientAmount(0)
    } else if (value === 'insurance') {
      form.setFieldsValue({
        case_number: null,
        insurance_id: appointment?.insurance_id || selectedPatient?.insurance_id || null,
        insurance_code: appointment?.insurance_code || selectedPatient?.insurance_code || null,
      })
    }
  }

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient)
    if (patient && patient.insurance) {
      form.setFieldValue('insurance_id', patient.insurance.id)
      form.setFieldValue('insurance_code', patient.insurance_code)
    }
  }

  const handleQuickRegisterSuccess = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowQuickRegister(false)
    if (patient.insurance) {
      form.setFieldsValue({
        guest_firstname: patient.firstname,
        guest_lastname: patient.lastname,
        dni: patient.dni,
        phone: patient.phone,
        passport: patient.passport,
        insurance_code: patient.insurance_code,
        insurance_id: patient.insurance?.id,
      })
    }
  }

  const handleSubmit = (values: any) => {
    const data: ConfirmAppointmentRequest = {
      patient_id: selectedPatient?.id,
      payment_type: values.payment_type,
      notes: values.notes,
    }

    // Para seguro
    if (values.payment_type === 'insurance') {
      data.insurance_id = values.insurance_id
      data.insurance_code = values.insurance_code

      // Solo para TERAPIA + SEGURO
      if (isTherapy) {
        data.authorization_number = values.authorization_number
        if (values.authorization_date) {
          data.authorization_date = dayjs(values.authorization_date).format('YYYY-MM-DD')
        }
        data.insurance_amount = insuranceAmount
        data.patient_amount = patientAmount
        data.total_amount = totalAmount
      }
    }

    // Para riesgo laboral
    if (values.payment_type === 'workplace_risk') {
      data.case_number = values.case_number
    }

    onConfirm(data)
  }

  const handleCancel = () => {
    form.resetFields()
    setSelectedPatient(null)
    setPaymentType('insurance')
    setInsuranceAmount(0)
    setPatientAmount(0)
    onClose()
  }

  if (!appointment) return null

  const hasPatient = selectedPatient || appointment.patient

  return (
    <>
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Confirmar Entrada - {isTherapy ? 'Terapia' : 'Consulta'}</span>
          </Space>
        }
        open={open}
        onCancel={handleCancel}
        width={800}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Información de la Cita */}
          <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Title level={5} style={{ margin: 0 }}>
                <CalendarOutlined /> Información de la Cita
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Tipo:</Text>{' '}
                  <Text strong style={{ color: isTherapy ? '#1890ff' : '#52c41a' }}>
                    {isTherapy ? 'TERAPIA' : 'CONSULTA'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Fecha:</Text>{' '}
                  <Text strong>{dayjs(appointment.appointment_date).format('DD/MM/YYYY')}</Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Hora:</Text>{' '}
                  <Text strong>
                    {dayjs(appointment.start_time, 'HH:mm').format('HH:mm')} -{' '}
                    {dayjs(appointment.end_time, 'HH:mm').format('HH:mm')}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Profesional:</Text>{' '}
                  <Text strong>
                    {appointment.employee
                      ? `${appointment.employee.firstname} ${appointment.employee.lastname}`
                      : 'Sin asignar'}
                  </Text>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Información del Paciente */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              backgroundColor: hasPatient ? '#f6ffed' : '#fff7e6',
              borderColor: hasPatient ? '#b7eb8f' : '#ffd591',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Title level={5} style={{ margin: 0 }}>
                <UserOutlined /> Información del Paciente
              </Title>

              {hasPatient ? (
                <>
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {selectedPatient?.firstname || appointment.patient?.firstname}{' '}
                    {selectedPatient?.lastname || appointment.patient?.lastname}
                  </Text>
                  <Space>
                    {(selectedPatient?.dni || appointment.patient?.dni) && (
                      <Text type="secondary">
                        DNI: {selectedPatient?.dni || appointment.patient?.dni}
                      </Text>
                    )}
                    {(selectedPatient?.phone || appointment.patient?.phone) && (
                      <Text type="secondary">
                        Tel: {selectedPatient?.phone || appointment.patient?.phone}
                      </Text>
                    )}
                  </Space>
                  <CustomButton size="small" onClick={() => setShowPatientSelector(true)}>
                    Cambiar Paciente
                  </CustomButton>
                </>
              ) : (
                <>
                  <Alert
                    message="Esta cita no tiene un paciente registrado"
                    description="Debe seleccionar o registrar un paciente antes de confirmar"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                  <Space>
                    <CustomButton type="primary" onClick={() => setShowPatientSelector(true)}>
                      Buscar Paciente Existente
                    </CustomButton>
                    <CustomButton onClick={() => setShowQuickRegister(true)}>
                      Registrar Nuevo Paciente
                    </CustomButton>
                  </Space>
                </>
              )}
            </Space>
          </Card>

          <Divider />

          {/* Tipo de Pago */}
          <CustomFormItem
            label={
              <Space>
                <DollarOutlined />
                <span>Tipo de Pago</span>
              </Space>
            }
            name="payment_type"
            required
          >
            <Radio.Group onChange={handlePaymentTypeChange} size="large">
              <Space direction="vertical">
                <Radio value="insurance">
                  <Space>
                    <SafetyOutlined />
                    <span>Con Seguro Médico</span>
                  </Space>
                </Radio>
                <Radio value="private">
                  <Space>
                    <DollarOutlined />
                    <span>Privado (Sin Seguro)</span>
                  </Space>
                </Radio>
                <Radio value="workplace_risk">
                  <Space>
                    <FileProtectOutlined />
                    <span>Riesgo Laboral (IDOPPRIL)</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </CustomFormItem>

          {/* Campos de Seguro */}
          {paymentType === 'insurance' && (
            <Card
              size="small"
              style={{
                backgroundColor: '#e6f7ff',
                borderColor: '#91d5ff',
                marginBottom: 16,
              }}
            >
              <Title level={5} style={{ marginTop: 0 }}>
                <SafetyOutlined /> Datos de Seguro
              </Title>

              <Row gutter={16}>
                <Col span={24}>
                  <CustomFormItem label="Compañía de Seguro" name="insurance_id" required>
                    <CustomSelect
                      placeholder="Seleccionar seguro..."
                      showSearch
                      optionFilterProp="children"
                    >
                      {insurances.map((insurance) => (
                        <Option key={insurance.id} value={insurance.id}>
                          {insurance.name}
                        </Option>
                      ))}
                    </CustomSelect>
                  </CustomFormItem>
                </Col>
                <Col span={24}>
                  <CustomFormItem label="Código de Seguro" name="insurance_code">
                    <CustomInput placeholder="Código del seguro médico" disabled />
                  </CustomFormItem>
                </Col>
              </Row>

              {/* Campos de Autorización y Montos - SOLO para TERAPIA + SEGURO */}
              {requiresAuthorization && (
                <>
                  <Alert
                    message="Autorización y Montos Requeridos"
                    description="Las terapias por seguro requieren número de autorización y registro de montos de cobro"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

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
                      <CustomFormItem label="Fecha de Autorización" name="authorization_date">
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          placeholder="Seleccionar fecha"
                          defaultValue={dayjs()}
                        />
                      </CustomFormItem>
                    </Col>
                  </Row>

                  <Divider orientation="left">Distribución de Costos</Divider>

                  <Row gutter={16}>
                    <Col span={12}>
                      <CustomFormItem
                        label="Monto Cubierto por Seguro"
                        required
                        tooltip="Monto que pagará la compañía de seguro"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={10}
                          precision={2}
                          prefix="RD$"
                          placeholder="0.00"
                          value={insuranceAmount}
                          onChange={(value) => setInsuranceAmount(value || 0)}
                        />
                      </CustomFormItem>
                    </Col>
                    <Col span={12}>
                      <CustomFormItem
                        label="Copago del Paciente"
                        required
                        tooltip="Monto que pagará el paciente (puede ser 0)"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={10}
                          precision={2}
                          prefix="RD$"
                          placeholder="0.00"
                          value={patientAmount}
                          onChange={(value) => setPatientAmount(value || 0)}
                        />
                      </CustomFormItem>
                    </Col>
                  </Row>

                  <Card
                    size="small"
                    style={{
                      background: '#f6ffed',
                      marginTop: 16,
                      textAlign: 'center',
                    }}
                  >
                    <Space size="large">
                      <div>
                        <Text type="secondary">Seguro</Text>
                        <br />
                        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                          RD$ {insuranceAmount.toFixed(2)}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">Copago</Text>
                        <br />
                        <Text strong style={{ fontSize: 16, color: '#fa8c16' }}>
                          RD$ {patientAmount.toFixed(2)}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">TOTAL</Text>
                        <br />
                        <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
                          RD$ {totalAmount.toFixed(2)}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </>
              )}

              {/* Nota informativa para CONSULTA + SEGURO */}
              {isConsultation && (
                <Alert
                  message="Las consultas por seguro no requieren autorización previa"
                  description="La autorización se realizará después de completar la consulta"
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          )}

          {/* Campos de Riesgo Laboral */}
          {paymentType === 'workplace_risk' && (
            <Card
              size="small"
              style={{
                backgroundColor: '#fff7e6',
                borderColor: '#ffd591',
                marginBottom: 16,
              }}
            >
              <Title level={5} style={{ marginTop: 0 }}>
                <FileProtectOutlined /> Riesgo Laboral (IDOPPRIL)
              </Title>

              <Alert
                message={isConsultation ? 'Autorización Posterior' : 'Número de Caso Requerido'}
                description={
                  isConsultation
                    ? 'Para consultas de riesgo laboral, el paciente debe ir a IDOPPRIL después de la consulta para autorización'
                    : 'Para terapias de riesgo laboral, registre el número de caso proporcionado por IDOPPRIL'
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={16}>
                <Col span={24}>
                  <CustomFormItem label="Número de Caso" name="case_number" required>
                    <CustomInput placeholder="Ej: CASO-2025-001" />
                  </CustomFormItem>
                </Col>
                {paymentType === 'workplace_risk' && isTherapy && (
                  <Col span={24}>
                    <CustomFormItem
                      label="Número de Autorización"
                      name="authorization_number"
                      required
                    >
                      <CustomInput placeholder="Ej: AUT-2025-001" />
                    </CustomFormItem>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Notas */}
          <CustomFormItem label="Notas Adicionales" name="notes">
            <CustomInput.TextArea rows={3} placeholder="Observaciones sobre la confirmación..." />
          </CustomFormItem>

          {/* Botones */}
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CheckCircleOutlined />}
              disabled={!hasPatient || (requiresAmounts && insuranceAmount <= 0)}
            >
              Confirmar Llegada
            </CustomButton>
          </Space>
        </Form>
      </Modal>

      {/* Modales auxiliares */}
      <PatientSelectorModal
        open={showPatientSelector}
        onClose={() => setShowPatientSelector(false)}
        onSelect={handlePatientSelect}
        selectedPatientId={selectedPatient?.id || appointment.patient_id}
        title="Seleccionar Paciente para la Cita"
        allowClear={false}
      />

      <QuickPatientRegister
        open={showQuickRegister}
        onClose={() => setShowQuickRegister(false)}
        onSuccess={handleQuickRegisterSuccess}
        appointment={appointment}
      />
    </>
  )
}
