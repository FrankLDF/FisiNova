// src/features/appointment/components/AuthorizeTherapyModal.tsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Row,
  Col,
  Space,
  Card,
  Typography,
  Alert,
  InputNumber,
  Steps,
  Table,
  Button,
  Descriptions,
  Tag,
  Divider,
  Collapse,
  Checkbox,
  TimePicker,
} from 'antd'
import {
  CheckCircleOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  UserOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  DollarOutlined,
  SafetyOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomButton } from '../../../components/Button/CustomButton'
import { PatientSelectorModal } from '../../../components/modals/PatientSelectorModal'
import { CalendarAvailabilityModal } from './CalendarAvailabilityModal'
import type { Appointment } from '../models/appointment'
import type { Patient } from '../../patient/models/patient'
import dayjs, { Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import type { MedicalRecord } from '../../consultation/models/medicalRecords'
import appointmentService from '../services/appointment'
import { showNotification } from '../../../utils/showNotification'
import { Positions } from '../../../utils/constants'
import consultationService from '../../consultation/services/consultation'

const { Title, Text } = Typography
const { Panel } = Collapse

interface TherapySession {
  id: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'conflict'
  conflictMessage?: string
}

interface Employee {
  id: number
  firstname: string
  lastname: string
  position?: { name: string }
}

interface Insurance {
  id: number
  name: string
  code?: string
  provider_code?: string
}

interface AuthorizeTherapyModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: any) => void
  appointment: Appointment | null
  insurances: Array<Insurance>
  loading?: boolean
  medicalRecord?: MedicalRecord
}

const steps = [
  { title: 'Paciente', icon: <UserOutlined /> },
  { title: 'Autorización', icon: <FileProtectOutlined /> },
  { title: 'Terapista', icon: <TeamOutlined /> },
  { title: 'Sesiones', icon: <CalendarOutlined /> },
]

export const AuthorizeTherapyModal: React.FC<AuthorizeTherapyModalProps> = ({
  open,
  onClose,
  onConfirm,
  appointment,
  insurances,
  loading,
  medicalRecord,
}) => {
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Terapistas
  const [therapists, setTherapists] = useState<Employee[]>([])
  const [loadingTherapists, setLoadingTherapists] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<number | undefined>(undefined)
  
  // Programación múltiple
  const [bulkScheduleModalOpen, setBulkScheduleModalOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [bulkStartTime, setBulkStartTime] = useState<Dayjs | null>(null)
  const [bulkEndTime, setBulkEndTime] = useState<Dayjs | null>(null)
  const [bulkStartDate, setBulkStartDate] = useState<Dayjs>(dayjs())
  
  // Montos
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0)
  const [patientAmount, setPatientAmount] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)

  // Solo cargar terapistas cuando se abre
  useEffect(() => {
    if (open) {
      loadTherapists()
    }
  }, [open])

  // Calcular total automáticamente
  useEffect(() => {
    setTotalAmount(insuranceAmount + patientAmount)
  }, [insuranceAmount, patientAmount])

  // Inicializar formulario UNA SOLA VEZ
  useEffect(() => {
    if (appointment && open && !isInitialized) {
      console.log('🎯 Inicializando formulario con datos de la cita...')
      
      if (appointment.patient) {
        setSelectedPatient(appointment.patient as Patient)
      }

      const today = dayjs().format('YYYY-MM-DD')
      const initialValues = {
        insurance_id: appointment.insurance_id || appointment.patient?.insurance_id,
        authorization_date: today,
        sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
        insurance_amount: 0,
        patient_amount: 0,
      }

      form.setFieldsValue(initialValues)
      setIsInitialized(true)
      
      console.log('📝 Valores iniciales del formulario:', initialValues)
      console.log('📅 Fecha de hoy:', today)
    }
  }, [appointment, open, isInitialized, form, medicalRecord])

  // Resetear al cerrar
  useEffect(() => {
    if (!open) {
      console.log('🔄 Reseteando modal...')
      setCurrentStep(0)
      setSessions([])
      setSelectedPatient(null)
      setSelectedTherapist(undefined)
      setInsuranceAmount(0)
      setPatientAmount(0)
      setIsInitialized(false)
      form.resetFields()
    }
  }, [open, form])

  const loadTherapists = async () => {
    try {
      setLoadingTherapists(true)
      const response = await appointmentService.getEmployees({ 
        position_id: Positions.THERAPIST 
      })
      const therapistData = response?.data?.data || response?.data || []
      setTherapists(Array.isArray(therapistData) ? therapistData : [])
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error al cargar terapistas',
      })
      setTherapists([])
    } finally {
      setLoadingTherapists(false)
    }
  }

  const handleCancel = () => {
    console.log('❌ Cerrando modal y limpiando datos...')
    form.resetFields()
    setCurrentStep(0)
    setSessions([])
    setSelectedPatient(null)
    setSelectedTherapist(undefined)
    setInsuranceAmount(0)
    setPatientAmount(0)
    setIsInitialized(false)
    onClose()
  }

  const nextStep = () => {
    console.log('➡️ Avanzando al siguiente paso...')
    console.log('📊 Valores actuales antes de avanzar:', form.getFieldsValue())
    
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1)
      console.log('✅ Validación exitosa, nuevo paso:', currentStep + 1)
    }).catch((error) => {
      console.log('❌ Error de validación:', error)
    })
  }

  const prevStep = () => {
    console.log('⬅️ Retrocediendo al paso anterior...')
    console.log('📊 Valores actuales antes de retroceder:', form.getFieldsValue())
    setCurrentStep(currentStep - 1)
  }

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleTimeSelected = (date: string, startTime: string, endTime: string) => {
    const newSession: TherapySession = {
      id: generateSessionId(),
      date: date,
      startTime: startTime,
      endTime: endTime,
      status: 'pending',
    }

    setSessions([...sessions, newSession])
    setIsCalendarOpen(false)
    
    showNotification({
      type: 'success',
      message: 'Sesión agregada',
    })
  }

  const removeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId))
  }

  const handleTherapistChange = (therapistId: number) => {
    console.log('👨‍⚕️ Cambio de terapista:', selectedTherapist, '->', therapistId)
    
    if (sessions.length > 0) {
      Modal.confirm({
        title: '¿Cambiar terapista?',
        content: 'Al cambiar el terapista se eliminarán las sesiones programadas. ¿Desea continuar?',
        onOk: () => {
          setSelectedTherapist(therapistId)
          setSessions([])
          console.log('✅ Terapista cambiado y sesiones eliminadas')
        },
        onCancel: () => {
          form.setFieldValue('therapist_id', selectedTherapist)
          console.log('❌ Cambio cancelado, terapista mantenido')
        },
      })
    } else {
      setSelectedTherapist(therapistId)
      console.log('✅ Terapista seleccionado (sin sesiones previas)')
    }
  }

  const handleBulkSchedule = () => {
    if (!bulkStartTime || !bulkEndTime || selectedDays.length === 0) {
      showNotification({
        type: 'error',
        message: 'Debe seleccionar días y horarios',
      })
      return
    }

    const sessionsAuthorized = form.getFieldValue('sessions_authorized') || 0
    const remainingSessions = sessionsAuthorized - sessions.length

    if (remainingSessions <= 0) {
      showNotification({
        type: 'error',
        message: 'Ya programó todas las sesiones autorizadas',
      })
      return
    }

    const newSessions: TherapySession[] = []
    let currentDate = bulkStartDate.clone()
    let sessionsCreated = 0

    while (sessionsCreated < remainingSessions && currentDate.diff(bulkStartDate, 'days') < 60) {
      const dayOfWeek = currentDate.day()
      
      if (selectedDays.includes(dayOfWeek)) {
        const newSession: TherapySession = {
          id: generateSessionId(),
          date: currentDate.format('YYYY-MM-DD'),
          startTime: bulkStartTime.format('HH:mm:ss'),
          endTime: bulkEndTime.format('HH:mm:ss'),
          status: 'pending',
        }
        newSessions.push(newSession)
        sessionsCreated++
      }

      currentDate = currentDate.add(1, 'day')
    }

    setSessions([...sessions, ...newSessions])
    setBulkScheduleModalOpen(false)
    
    showNotification({
      type: 'success',
      message: `Se agregaron ${newSessions.length} sesiones`,
    })
  }

  const handleSubmit = () => {
    console.log('🔍 Valores actuales del formulario:', form.getFieldsValue())
    
    form.validateFields([
      'authorization_number',
      'insurance_id', 
      'sessions_authorized',
      'authorization_date',
      'insurance_amount',
      'patient_amount',
    ]).then((values) => {
      if (!selectedPatient) {
        Modal.error({
          title: 'Error',
          content: 'Debe seleccionar un paciente',
        })
        return
      }

      if (!selectedTherapist) {
        Modal.error({
          title: 'Error',
          content: 'Debe seleccionar un terapista',
        })
        return
      }

      if (sessions.length === 0) {
        Modal.error({
          title: 'Error',
          content: 'Debe programar al menos una sesión de terapia',
        })
        return
      }

      const sessionsAuthorized = values.sessions_authorized
      if (sessions.length !== sessionsAuthorized) {
        Modal.error({
          title: 'Error',
          content: `Debe programar exactamente ${sessionsAuthorized} sesiones. Actualmente tiene ${sessions.length} sesiones.`,
        })
        return
      }

      if (!values.insurance_amount || values.insurance_amount <= 0) {
        Modal.error({
          title: 'Error',
          content: 'Debe ingresar el monto cubierto por el seguro',
        })
        return
      }

      if (values.patient_amount === undefined || values.patient_amount === null || values.patient_amount < 0) {
        Modal.error({
          title: 'Error',
          content: 'Debe ingresar el copago del paciente (puede ser 0)',
        })
        return
      }

      const data = {
        patient_id: selectedPatient.id,
        authorization_number: values.authorization_number,
        authorization_date: values.authorization_date || dayjs().format('YYYY-MM-DD'),
        insurance_id: values.insurance_id,
        insurance_amount: Number(values.insurance_amount),
        patient_amount: Number(values.patient_amount),
        total_amount: Number(values.insurance_amount) + Number(values.patient_amount),
        sessions_authorized: sessionsAuthorized,
        therapist_id: selectedTherapist,
        notes: values.notes || null,
        sessions: sessions.map((session) => ({
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
        })),
      }

      console.log('📤 Datos a enviar:', data)
      onConfirm(data)
    }).catch((error) => {
      console.error('❌ Error de validación:', error)
      Modal.error({
        title: 'Error de Validación',
        content: 'Por favor complete todos los campos requeridos correctamente',
      })
    })
  }

  const sessionColumns: ColumnsType<TherapySession> = [
    {
      title: '#',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Día',
      dataIndex: 'date',
      render: (date: string) => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        return days[dayjs(date).day()]
      },
    },
    {
      title: 'Horario',
      render: (_, record) => `${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)}`,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'blue',
          confirmed: 'green',
          conflict: 'red',
        }
        const labels = {
          pending: 'Pendiente',
          confirmed: 'Confirmado',
          conflict: 'Conflicto',
        }
        return <Tag color={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Tag>
      },
    },
    {
      title: 'Acciones',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeSession(record.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ]

  const renderMedicalRecordSummary = () => {
    if (!medicalRecord) return null

    return (
      <Card 
        size="small" 
        title={
          <Space>
            <MedicineBoxOutlined />
            <span>Resumen del Expediente Médico</span>
          </Space>
        } 
        style={{ marginBottom: 16 }}
      >
        <Collapse ghost>
          <Panel header="Ver detalles completos del expediente" key="1">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Motivo de Consulta" span={2}>
                  {medicalRecord.chief_complaint || 'No especificado'}
                </Descriptions.Item>
                
                {medicalRecord.therapy_reason && (
                  <Descriptions.Item label="Razón de Terapia" span={2}>
                    <Tag color="blue">{medicalRecord.therapy_reason}</Tag>
                  </Descriptions.Item>
                )}
                
                {medicalRecord.therapy_sessions_needed && (
                  <Descriptions.Item label="Sesiones Recomendadas" span={2}>
                    <Tag color="green">{medicalRecord.therapy_sessions_needed} sesiones</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {medicalRecord.diagnostics && medicalRecord.diagnostics.length > 0 && (
                <Card 
                  size="small" 
                  title={<><MedicineBoxOutlined style={{ color: '#1890ff' }} /> Diagnósticos del Estándar</>}
                  headStyle={{ background: '#f0f5ff' }}
                >
                  <Space wrap size="small">
                    {medicalRecord.diagnostics.map((diag: any) => (
                      <Tag key={diag.id} color="blue" style={{ margin: '2px' }}>
                        <strong>{diag.code}</strong> - {diag.description}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              )}

              {medicalRecord.procedures && medicalRecord.procedures.length > 0 && (
                <Card 
                  size="small" 
                  title="Procedimientos del Estándar Realizados"
                  headStyle={{ background: '#f6ffed' }}
                >
                  <Space wrap size="small">
                    {medicalRecord.procedures.map((proc: any) => (
                      <Tag key={proc.id} color="green" style={{ margin: '2px' }}>
                        <strong>{proc.code}</strong> - {proc.description}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              )}
            </Space>
          </Panel>
        </Collapse>
      </Card>
    )
  }

  const renderAppointmentInfo = () => {
    if (!appointment) return null

    return (
      <Card 
        size="small" 
        title={
          <Space>
            <CalendarOutlined />
            <span>Información de la Cita</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Fecha de Cita">
            {dayjs(appointment.appointment_date).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Horario">
            {appointment.start_time} - {appointment.end_time}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo de Cita">
            <Tag color="purple">
              {appointment.type === 'consultation' ? 'CONSULTA' : 'TERAPIA'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="green">{appointment.status}</Tag>
          </Descriptions.Item>
          {appointment.employee && (
            <Descriptions.Item label="Médico Tratante" span={2}>
              Dr. {appointment.employee.firstname} {appointment.employee.lastname}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    )
  }

  const selectedTherapistData = therapists.find((t) => t.id === selectedTherapist)
  const appointmentInsurance = appointment?.insurance || 
    (appointment?.insurance_id ? insurances.find(i => i.id === appointment.insurance_id) : null)

  const daysOfWeek = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ]

  return (
    <>
      <Modal
        title={
          <Space>
            <FileProtectOutlined style={{ color: '#1890ff' }} />
            <span>Autorizar Terapias y Programar Sesiones</span>
          </Space>
        }
        open={open}
        onCancel={handleCancel}
        width={1200}
        footer={null}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
          <Form
            form={form}
            layout="vertical"
          >
            {/* PASO 0: INFORMACIÓN DEL PACIENTE */}
            {currentStep === 0 && (
              <>
                {renderAppointmentInfo()}
                {renderMedicalRecordSummary()}

                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Información del Paciente</span>
                    </Space>
                  }
                  size="small"
                >
                  {selectedPatient ? (
                    <>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Nombre Completo">
                          <Text strong>
                            {selectedPatient.firstname} {selectedPatient.lastname}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="DNI">{selectedPatient.dni}</Descriptions.Item>
                        <Descriptions.Item label="Teléfono">
                          {selectedPatient.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Edad">
                          {selectedPatient.birthdate 
                            ? dayjs().diff(dayjs(selectedPatient.birthdate), 'year') + ' años'
                            : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sexo">
                          {selectedPatient.sex === 'M' ? 'Masculino' : 'Femenino'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Código de Seguro">
                          {selectedPatient.insurance_code || 'N/A'}
                        </Descriptions.Item>
                      </Descriptions>
                      
                      {appointmentInsurance && (
                        <Card size="small" style={{ marginTop: 16, background: '#f0f5ff' }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                              <SafetyOutlined style={{ color: '#1890ff' }} />
                              <Text strong>Seguro de la Cita:</Text>
                            </Space>
                            <Descriptions bordered size="small" column={2}>
                              <Descriptions.Item label="Compañía" span={2}>
                                <Text strong>{appointmentInsurance.name}</Text>
                              </Descriptions.Item>
                              <Descriptions.Item label="No. Afiliado">
                                {selectedPatient.insurance_code || 'N/A'}
                              </Descriptions.Item>
                            </Descriptions>
                          </Space>
                        </Card>
                      )}
                      
                      <Button
                        type="link"
                        onClick={() => setShowPatientModal(true)}
                        style={{ marginTop: 8 }}
                      >
                        Cambiar paciente
                      </Button>
                    </>
                  ) : (
                    <Button type="dashed" block onClick={() => setShowPatientModal(true)}>
                      Seleccionar Paciente
                    </Button>
                  )}
                </Card>
              </>
            )}

            {/* PASO 1: DATOS DE AUTORIZACIÓN */}
            {currentStep === 1 && (
              <>
                <Alert
                  message="Información de la Autorización"
                  description="Complete los datos de la autorización del seguro médico y los montos correspondientes"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <CustomFormItem
                        label="Número de Autorización"
                        name="authorization_number"
                        required
                        tooltip="Número de autorización emitido por el seguro"
                      >
                        <CustomInput placeholder="Ej: AUT-2025-001234" />
                      </CustomFormItem>
                    </Col>
                    <Col span={12}>
                      <CustomFormItem label="Compañía de Seguro" name="insurance_id" required>
                        <CustomSelect 
                          placeholder="Seleccionar seguro" 
                          loading={false}
                          disabled={!!appointment?.insurance_id}
                        >
                          {insurances.map((insurance) => (
                            <Option key={insurance.id} value={insurance.id}>
                              {insurance.name}
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
                      {appointment?.insurance_id && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <InfoCircleOutlined /> El seguro proviene de la cita y no puede ser modificado
                        </Text>
                      )}
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <CustomFormItem
                        label="Sesiones Autorizadas"
                        name="sessions_authorized"
                        required
                      >
                        <InputNumber
                          min={1}
                          max={50}
                          placeholder="Número de sesiones"
                          style={{ width: '100%' }}
                        />
                      </CustomFormItem>
                    </Col>
                    <Col span={12}>
                      <CustomFormItem
                        label="Fecha de Autorización"
                        name="authorization_date"
                        tooltip="Fecha en que se emitió la autorización (por defecto hoy)"
                      >
                        <CustomInput type="date" />
                      </CustomFormItem>
                    </Col>
                  </Row>

                  <Divider>Distribución de Costos</Divider>

                  <Card
                    size="small"
                    style={{ background: '#f6ffed', marginBottom: 16 }}
                    title={<><DollarOutlined /> Montos</>}
                  >
                    <Alert
                      message="Importante"
                      description="Ingrese el monto que cubrirá el seguro y el copago del paciente. El total se calculará automáticamente."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <CustomFormItem
                          label="Monto cubierto por el Seguro"
                          name="insurance_amount"
                          required
                          tooltip="Monto que pagará la compañía de seguro"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            precision={2}
                            prefix="RD$"
                            placeholder="0.00"
                            onChange={(value) => {
                              console.log('💰 Monto seguro cambiado:', value)
                              setInsuranceAmount(value || 0)
                              form.setFieldValue('insurance_amount', value || 0)
                            }}
                          />
                        </CustomFormItem>
                      </Col>
                      <Col span={12}>
                        <CustomFormItem
                          label="Copago del Paciente"
                          name="patient_amount"
                          required
                          tooltip="Monto que pagará el paciente (puede ser 0)"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            precision={2}
                            prefix="RD$"
                            placeholder="0.00"
                            onChange={(value) => {
                              console.log('💵 Copago cambiado:', value)
                              setPatientAmount(value || 0)
                              form.setFieldValue('patient_amount', value || 0)
                            }}
                          />
                        </CustomFormItem>
                      </Col>
                    </Row>

                    <Divider />

                    <Row justify="end">
                      <Space size="large">
                        <Text>
                          Seguro:{' '}
                          <Text strong style={{ color: '#1890ff' }}>
                            RD$ {insuranceAmount.toFixed(2)}
                          </Text>
                        </Text>
                        <Text>
                          Copago:{' '}
                          <Text strong style={{ color: '#fa8c16' }}>
                            RD$ {patientAmount.toFixed(2)}
                          </Text>
                        </Text>
                        <Text>
                          TOTAL:{' '}
                          <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                            RD$ {totalAmount.toFixed(2)}
                          </Text>
                        </Text>
                      </Space>
                    </Row>
                  </Card>

                  <CustomFormItem label="Notas Adicionales" name="notes">
                    <CustomInput.TextArea
                      rows={3}
                      placeholder="Observaciones sobre la autorización..."
                    />
                  </CustomFormItem>
                </Card>
              </>
            )}

            {/* PASO 2: SELECCIÓN DE TERAPISTA */}
            {currentStep === 2 && (
              <>
                <Alert
                  message="Seleccionar Terapista"
                  description="Elija el terapista que realizará las sesiones de terapia"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card size="small">
                  <CustomFormItem label="Terapista Asignado" name="therapist_id" required>
                    <CustomSelect
                      placeholder="Seleccione un terapista"
                      loading={loadingTherapists}
                      onChange={handleTherapistChange}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {therapists.map((therapist) => (
                        <Option key={therapist.id} value={therapist.id}>
                          {therapist.firstname} {therapist.lastname}
                        </Option>
                      ))}
                    </CustomSelect>
                  </CustomFormItem>

                  {selectedTherapistData && (
                    <Card size="small" style={{ background: '#f6ffed' }}>
                      <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="Terapista Seleccionado" span={2}>
                          <Text strong>
                            {selectedTherapistData.firstname} {selectedTherapistData.lastname}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Posición">
                          {selectedTherapistData.position?.name || 'Terapista'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  )}
                </Card>
              </>
            )}

            {/* PASO 3: PROGRAMAR SESIONES */}
            {currentStep === 3 && (
              <>
                <Alert
                  message="Programación de Sesiones"
                  description={`Debe programar exactamente ${
                    form.getFieldValue('sessions_authorized') || 0
                  } sesiones. Puede hacerlo una por una o programar múltiples sesiones automáticamente.`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          icon={<CalendarOutlined />}
                          onClick={() => setIsCalendarOpen(true)}
                          disabled={!selectedTherapist}
                          block
                          size="large"
                        >
                          <Space>
                            <ClockCircleOutlined />
                            Agregar Sesión Individual
                          </Space>
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          type="default"
                          icon={<PlusOutlined />}
                          onClick={() => setBulkScheduleModalOpen(true)}
                          disabled={!selectedTherapist}
                          block
                          size="large"
                        >
                          <Space>
                            <CalendarOutlined />
                            Programar Múltiples Sesiones
                          </Space>
                        </Button>
                      </Col>
                    </Row>

                    {!selectedTherapist && (
                      <Alert
                        message="Debe seleccionar un terapista primero"
                        type="warning"
                        showIcon
                      />
                    )}

                    <Divider>Sesiones Programadas ({sessions.length})</Divider>

                    {sessions.length > 0 && (
                      <Alert
                        message={`${sessions.length} de ${
                          form.getFieldValue('sessions_authorized') || 0
                        } sesiones programadas`}
                        type={
                          sessions.length === form.getFieldValue('sessions_authorized')
                            ? 'success'
                            : 'warning'
                        }
                        showIcon
                      />
                    )}
                  </Space>
                </Card>

                <Table
                  columns={sessionColumns}
                  dataSource={sessions}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'No hay sesiones programadas. Use los botones arriba para agregar sesiones.' }}
                  scroll={{ y: 300 }}
                />
              </>
            )}
          </Form>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            {currentStep > 0 && <CustomButton onClick={prevStep}>Anterior</CustomButton>}
            <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
          </Space>

          <Space>
            {currentStep < 3 ? (
              <CustomButton
                type="primary"
                onClick={nextStep}
                disabled={
                  (currentStep === 0 && !selectedPatient) ||
                  (currentStep === 2 && !selectedTherapist)
                }
              >
                Siguiente
              </CustomButton>
            ) : (
              <CustomButton
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSubmit}
                loading={loading}
                disabled={
                  sessions.length === 0 ||
                  sessions.length !== form.getFieldValue('sessions_authorized')
                }
              >
                Autorizar y Crear {sessions.length} Citas de Terapia
              </CustomButton>
            )}
          </Space>
        </Space>
      </Modal>

      {/* Modal de Programación Múltiple */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Programar Múltiples Sesiones</span>
          </Space>
        }
        open={bulkScheduleModalOpen}
        onCancel={() => setBulkScheduleModalOpen(false)}
        onOk={handleBulkSchedule}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Programación Automática"
            description="Seleccione los días de la semana y el horario. El sistema creará sesiones automáticamente hasta completar el número autorizado."
            type="info"
            showIcon
          />

          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Días de la Semana:</Text>
              <Checkbox.Group
                options={daysOfWeek}
                value={selectedDays}
                onChange={setSelectedDays}
              />
            </Space>
          </Card>

          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Horario:</Text>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>Hora Inicio:</Text>
                  <TimePicker
                    value={bulkStartTime}
                    onChange={setBulkStartTime}
                    format="HH:mm"
                    style={{ width: '100%' }}
                    minuteStep={15}
                  />
                </Col>
                <Col span={12}>
                  <Text>Hora Fin:</Text>
                  <TimePicker
                    value={bulkEndTime}
                    onChange={setBulkEndTime}
                    format="HH:mm"
                    style={{ width: '100%' }}
                    minuteStep={15}
                  />
                </Col>
              </Row>
            </Space>
          </Card>

          <Card size="small">
            <Text strong>Fecha de Inicio:</Text>
            <CustomInput
              type="date"
              value={bulkStartDate.format('YYYY-MM-DD')}
              onChange={(e) => setBulkStartDate(dayjs(e.target.value))}
              style={{ width: '100%', marginTop: 8 }}
            />
          </Card>

          <Alert
            message={`Se programarán aproximadamente ${
              form.getFieldValue('sessions_authorized') - sessions.length
            } sesiones restantes`}
            type="success"
            showIcon
          />
        </Space>
      </Modal>

      <PatientSelectorModal
        open={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelect={(patient) => {
          setSelectedPatient(patient)
          setShowPatientModal(false)
        }}
        selectedPatientId={selectedPatient?.id}
        title="Seleccionar Paciente para las Terapias"
        allowClear={false}
      />

      <CalendarAvailabilityModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        doctorId={selectedTherapist}
        doctorName={
          selectedTherapistData
            ? `${selectedTherapistData.firstname} ${selectedTherapistData.lastname}`
            : undefined
        }
        onTimeSelected={handleTimeSelected}
        duration={60}
      />
    </>
  )
}