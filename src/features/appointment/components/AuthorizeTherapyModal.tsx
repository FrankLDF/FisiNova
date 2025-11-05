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
  Select,
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

const { Title, Text } = Typography
const { Panel } = Collapse

interface TherapySession {
  id: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed'
}

interface Employee {
  id: number
  firstname: string
  lastname: string
  position?: { name: string }
}

interface AuthorizeTherapyModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: any) => void
  appointment: Appointment | null
  insurances: Array<{ id: number; name: string }>
  loading?: boolean
  medicalRecord?: MedicalRecord
}

const steps = [
  {
    title: 'Paciente',
    icon: <UserOutlined />,
  },
  {
    title: 'Autorización',
    icon: <FileProtectOutlined />,
  },
  {
    title: 'Terapista',
    icon: <TeamOutlined />,
  },
  {
    title: 'Sesiones',
    icon: <CalendarOutlined />,
  },
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
  
  // Terapistas
  const [therapists, setTherapists] = useState<Employee[]>([])
  const [loadingTherapists, setLoadingTherapists] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (open) {
      loadTherapists()
    }
  }, [open])

  useEffect(() => {
    if (appointment && open) {
      if (appointment.patient) {
        setSelectedPatient(appointment.patient as Patient)
      }

      form.setFieldsValue({
        insurance_id: appointment.insurance_id || appointment.patient?.insurance_id,
        authorization_date: dayjs(),
        sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
      })
    }
  }, [appointment, open, form, medicalRecord])

  useEffect(() => {
    if (!open) {
      setCurrentStep(0)
      setSessions([])
      setSelectedPatient(null)
      setSelectedTherapist(undefined)
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
    form.resetFields()
    setCurrentStep(0)
    setSessions([])
    setSelectedPatient(null)
    setSelectedTherapist(undefined)
    onClose()
  }

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1)
    })
  }

  const prevStep = () => {
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
    setSelectedTherapist(therapistId)
    // Limpiar sesiones si cambia el terapista
    if (sessions.length > 0) {
      Modal.confirm({
        title: '¿Cambiar terapista?',
        content: 'Al cambiar el terapista se eliminarán las sesiones programadas. ¿Desea continuar?',
        onOk: () => {
          setSessions([])
        },
        onCancel: () => {
          form.setFieldValue('therapist_id', selectedTherapist)
        },
      })
    }
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
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

      const sessionsAuthorized = form.getFieldValue('sessions_authorized')
      if (sessions.length !== sessionsAuthorized) {
        Modal.error({
          title: 'Error',
          content: `Debe programar exactamente ${sessionsAuthorized} sesiones. Actualmente tiene ${sessions.length} sesiones.`,
        })
        return
      }

      const data = {
        patient_id: selectedPatient.id,
        authorization_number: values.authorization_number,
        authorization_date: values.authorization_date
          ? dayjs(values.authorization_date).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
        insurance_id: values.insurance_id,
        sessions_authorized: sessionsAuthorized,
        therapist_id: selectedTherapist,
        notes: values.notes,
        sessions: sessions.map((session) => ({
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
        })),
      }

      onConfirm(data)
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
      title: 'Horario',
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color="blue">{status === 'pending' ? 'Pendiente' : 'Confirmado'}</Tag>
      ),
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
      <Card size="small" title="Resumen del Expediente" style={{ marginBottom: 16 }}>
        <Collapse ghost>
          <Panel header="Ver detalles del expediente médico" key="1">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Motivo de Consulta" span={2}>
                {medicalRecord.chief_complaint}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Diagnóstico Principal" span={2}>
                {medicalRecord.diagnostics}
              </Descriptions.Item> */}
              {medicalRecord.therapy_reason && (
                <Descriptions.Item label="Razón de Terapia" span={2}>
                  <Tag color="blue">{medicalRecord.therapy_reason}</Tag>
                </Descriptions.Item>
              )}
              {medicalRecord.therapy_sessions_needed && (
                <Descriptions.Item label="Sesiones Recomendadas">
                  <Tag color="green">{medicalRecord.therapy_sessions_needed} sesiones</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Panel>
        </Collapse>
      </Card>
    )
  }

  const selectedTherapistData = therapists.find((t) => t.id === selectedTherapist)

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'finish'
    if (step === currentStep) return 'process'
    return 'wait'
  }

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
            initialValues={{
              authorization_date: dayjs(),
              sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
            }}
          >
            {/* PASO 0: INFORMACIÓN DEL PACIENTE */}
            {currentStep === 0 && (
              <>
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
                          {selectedPatient.firstname} {selectedPatient.lastname}
                        </Descriptions.Item>
                        <Descriptions.Item label="DNI">{selectedPatient.dni}</Descriptions.Item>
                        <Descriptions.Item label="Teléfono">
                          {selectedPatient.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Seguro">
                          {selectedPatient.insurance?.name || 'Sin seguro'}
                        </Descriptions.Item>
                      </Descriptions>
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
                  description="Complete los datos de la autorización del seguro médico"
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
                      >
                        <CustomInput placeholder="Ej: AUT-2024-12345" />
                      </CustomFormItem>
                    </Col>
                    <Col span={12}>
                      <CustomFormItem label="Compañía de Seguro" name="insurance_id" required>
                        <CustomSelect placeholder="Seleccionar seguro" loading={false}>
                          {insurances.map((insurance) => (
                            <Option key={insurance.id} value={insurance.id}>
                              {insurance.name}
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
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
                  </Row>

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

                <Card
                  title={
                    <Space>
                      <TeamOutlined />
                      <span>Terapista Asignado</span>
                    </Space>
                  }
                  size="small"
                >
                  <CustomFormItem
                    label="Seleccionar Terapista"
                    name="therapist_id"
                    required
                    rules={[{ required: true, message: 'Debe seleccionar un terapista' }]}
                  >
                    <Select
                      placeholder="Seleccionar terapista"
                      loading={loadingTherapists}
                      showSearch
                      optionFilterProp="children"
                      onChange={handleTherapistChange}
                      style={{ width: '100%' }}
                    >
                      {therapists.map((therapist) => (
                        <Select.Option key={therapist.id} value={therapist.id}>
                          {therapist.firstname} {therapist.lastname}
                          {therapist.position && ` - ${therapist.position.name}`}
                        </Select.Option>
                      ))}
                    </Select>
                  </CustomFormItem>

                  {selectedTherapistData && (
                    <Card size="small" style={{ backgroundColor: '#f0f5ff', marginTop: 16 }}>
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Terapista seleccionado">
                          <Text strong>
                            {selectedTherapistData.firstname} {selectedTherapistData.lastname}
                          </Text>
                        </Descriptions.Item>
                        {selectedTherapistData.position && (
                          <Descriptions.Item label="Especialidad">
                            {selectedTherapistData.position.name}
                          </Descriptions.Item>
                        )}
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
                  } sesiones usando el calendario de disponibilidad del terapista.`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
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
                        Abrir Calendario de Disponibilidad
                      </Space>
                    </Button>

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
                  locale={{ emptyText: 'No hay sesiones programadas. Use el calendario para agregar sesiones.' }}
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