// src/features/appointment/pages/AppointmentForm.tsx - VERSIÓN MEJORADA Y RESPONSIVE
import {
  Card,
  Row,
  Col,
  Form,
  Grid,
  Skeleton,
  Steps,
  Space,
  Tag,
  Avatar,
  Divider,
  Alert,
  Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/input/CustomInput'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomDatePicker, CustomTimePicker } from '../../../components/form/CustomDatePicker'
import { CustomButton } from '../../../components/Button/CustomButton'
import { PatientSelectorField } from '../../../components/form/PatientSelectorField'
import { PatientSelectorModal } from '../../../components/modals/PatientSelectorModal'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import appointmentService from '../services/appointment'
import dayjs, { Dayjs } from 'dayjs'
import type { Patient } from '../../patient/models/patient'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'
import { Positions } from '../../../utils/constants'
import { AppointmentTimePickerModal } from '../components/AppointmentTimePickerModal'
import { useEmployeeAvailability } from '../hooks/useEmployeeAvailability'

const { Title, Text } = Typography

interface Employee {
  id: number
  firstname: string
  lastname: string
  position?: { name: string }
}

interface Insurance {
  id: number
  name: string
  provider_code?: string
}

type FormMode = 'create' | 'edit' | 'view'

export const AppointmentForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md // md = 768px

  const [employees, setEmployees] = useState<Employee[]>([])
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [loadingInsurances, setLoadingInsurances] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [editInsuranceCode, setEditInsuranceCode] = useState(true)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [mode, setMode] = useState<FormMode>('create')

  const startTime = Form.useWatch('start_time', form)
  const appointmentDate = Form.useWatch('appointment_date', form)
  const selectedEmployee = Form.useWatch('employee_id', form)

  const { validateSlot, validationError, clearValidationError } = useEmployeeAvailability(
    selectedEmployee || null
  )

  useEffect(() => {
    const currentPath = window.location.pathname
    if (id) {
      if (currentPath.includes('/edit') || currentPath.includes('/form')) {
        setMode('edit')
      } else {
        setMode('view')
      }
    } else {
      setMode('create')
    }
  }, [id])

  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointment(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    loadEmployees()
    loadInsurances()
  }, [])

  useEffect(() => {
    if (appointmentData?.data && id) {
      const appointment = appointmentData.data
      if (appointment.patient) {
        setSelectedPatient(appointment.patient)
      }

      form.setFieldsValue({
        employee_id: appointment.employee_id,
        appointment_date: appointment.appointment_date ? dayjs(appointment.appointment_date) : null,
        start_time: appointment.start_time ? dayjs(appointment.start_time, 'HH:mm') : null,
        end_time: appointment.end_time ? dayjs(appointment.end_time, 'HH:mm') : null,
        status: appointment.status,
        notes: appointment.notes,
        guest_firstname: appointment.guest_firstname || appointment.patient?.firstname,
        guest_lastname: appointment.guest_lastname || appointment.patient?.lastname,
        dni: appointment.dni || appointment.patient?.dni,
        phone: appointment.phone || appointment.patient?.phone,
        passport: appointment.passport || appointment.patient?.passport,
        insurance_code: appointment.insurance_code || appointment.patient?.insurance_code,
        insurance_id: appointment.insurance_id || appointment.patient?.insurance?.id,
      })

      setEditInsuranceCode(!appointment.patient?.insurance_code)
    }
  }, [appointmentData, form, id])

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await appointmentService.getEmployees({ position_id: Positions.MEDIC })
      const employeeData = response?.data?.data || response?.data || []
      setEmployees(Array.isArray(employeeData) ? employeeData : [])
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error al cargar empleados',
      })
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true)
      const response = await appointmentService.getAvaiableInsuranceCompanies()
      const insuranceData = response?.data?.data || response?.data || []
      setInsurances(Array.isArray(insuranceData) ? insuranceData : [])
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error al cargar compañías de seguro',
      })
      setInsurances([])
    } finally {
      setLoadingInsurances(false)
    }
  }

  const { mutate: createAppointment, isPending: isCreating } = useCustomMutation({
    execute: appointmentService.createAppointment,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Cita creada exitosamente',
      })
      navigate('/consult-appointments')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: updateAppointment, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      appointmentService.updateAppointment(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Cita actualizada exitosamente',
      })
      navigate('/consult-appointments')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient)

    if (patient) {
      form.setFieldsValue({
        guest_firstname: patient.firstname,
        guest_lastname: patient.lastname,
        dni: patient.dni,
        phone: patient.phone,
        passport: patient.passport,
        insurance_code: patient.insurance_code,
        insurance_id: patient.insurance?.id,
      })
    } else {
      form.setFieldsValue({
        guest_firstname: undefined,
        guest_lastname: undefined,
        dni: undefined,
        phone: undefined,
        passport: undefined,
        insurance_code: undefined,
        insurance_id: undefined,
      })
    }
  }

  const handleTimeSelected = (date: string, startTime: string, endTime: string) => {
    form.setFieldsValue({
      appointment_date: dayjs(date),
      start_time: dayjs(startTime, 'HH:mm'),
      end_time: dayjs(endTime, 'HH:mm'),
    })
    clearValidationError()
  }

  const handleManualDateTimeChange = async () => {
    const date = form.getFieldValue('appointment_date')
    const time = form.getFieldValue('start_time')

    if (date && time && selectedEmployee) {
      await validateSlot(
        date.format('YYYY-MM-DD'),
        time.format('HH:mm'),
        id ? Number(id) : undefined
      )
    }
  }

  const handleInsuranceChange = (insuranceId: number) => {
    const isDifferentFromPatient = selectedPatient?.insurance?.id !== insuranceId
    setEditInsuranceCode(isDifferentFromPatient)

    if (!isDifferentFromPatient && selectedPatient?.insurance_code) {
      form.setFieldValue('insurance_code', selectedPatient.insurance_code)
    }
  }

  const onFinish = async (values: any) => {
    try {
      if (!values.employee_id) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar un especialista',
        })
        return
      }

      if (!values.guest_firstname || !values.guest_lastname) {
        showNotification({
          type: 'error',
          message: 'Nombre y apellido son requeridos',
        })
        return
      }

      const appointmentData = {
        ...values,
        patient_id: selectedPatient?.id || null,
        appointment_date: values.appointment_date?.format('YYYY-MM-DD'),
        start_time: values.start_time?.format('HH:mm'),
        end_time: values.end_time?.format('HH:mm'),
        ...(selectedPatient && {
          dni: selectedPatient.dni,
          phone: selectedPatient.phone,
          passport: selectedPatient.passport,
          insurance_code: selectedPatient.insurance_code,
          insurance_id: selectedPatient.insurance?.id,
        }),
      }

      if (values.appointment_date && values.start_time && selectedEmployee) {
        const validation = await validateSlot(
          values.appointment_date.format('YYYY-MM-DD'),
          values.start_time.format('HH:mm'),
          id ? Number(id) : undefined
        )

        if (validation && !validation.is_available) {
          showNotification({
            type: 'error',
            message: 'Horario no disponible',
          })
          return
        }
      }

      if (mode === 'create') {
        createAppointment(appointmentData)
      } else if (mode === 'edit' && id) {
        updateAppointment({ id: Number(id), data: appointmentData })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error procesando los datos del formulario',
      })
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nueva Cita Médica'
      case 'edit':
        return 'Editar Cita'
      case 'view':
        return 'Detalles de la Cita'
      default:
        return 'Cita'
    }
  }

  const isPending = isCreating || isUpdating
  const isViewMode = mode === 'view'

  const selectedEmployeeData = employees.find((emp) => emp.id === selectedEmployee)

  if (loadingAppointment && id) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px' }}>
        <Card>
          <Skeleton active />
        </Card>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: isMobile ? '12px' : '24px',
        background: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? 16 : 24,
          borderRadius: 8,
        }}
        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={18} md={18}>
            <Space size={isMobile ? 'small' : 'middle'}>
              <Avatar
                size={isMobile ? 40 : 48}
                style={{ backgroundColor: '#1890ff' }}
                icon={<CalendarOutlined />}
              />
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  {getTitle()}
                </Title>
                {!isMobile && (
                  <Text type="secondary">
                    Complete la información para {mode === 'create' ? 'crear' : 'editar'} la cita
                  </Text>
                )}
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <CustomButton
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/consult-appointments')}
              block={isMobile}
            >
              {isMobile ? 'Volver' : 'Volver a Citas'}
            </CustomButton>
          </Col>
        </Row>
      </Card>

      <CustomForm form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 24]}>
          {/* Formulario Principal */}
          <Col xs={24} lg={16}>
            {/* Sección 1: Paciente */}
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#52c41a' }} />
                  <span>Información del Paciente</span>
                </Space>
              }
              style={{ marginBottom: isMobile ? 16 : 24 }}
              bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
              extra={
                !isMobile && (
                  <PatientSelectorField
                    selectedPatient={selectedPatient}
                    onOpenModal={() => setIsPatientModalOpen(true)}
                    onClear={() => handlePatientSelect(null)}
                    placeholder="Buscar"
                    allowClear={true}
                    showInfo={false}
                    disabled={isViewMode}
                    height={40}
                  />
                )
              }
            >
              {isMobile && (
                <div style={{ marginBottom: 16 }}>
                  <PatientSelectorField
                    selectedPatient={selectedPatient}
                    onOpenModal={() => setIsPatientModalOpen(true)}
                    onClear={() => handlePatientSelect(null)}
                    placeholder="Buscar Paciente"
                    allowClear={true}
                    showInfo={false}
                    disabled={isViewMode}
                  />
                </div>
              )}

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <CustomFormItem label="Nombre" name="guest_firstname" required>
                    <CustomInput
                      placeholder="Nombre del paciente"
                      readOnly={isViewMode}
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </CustomFormItem>
                </Col>

                <Col xs={24} sm={12}>
                  <CustomFormItem label="Apellido" name="guest_lastname" required>
                    <CustomInput
                      placeholder="Apellido del paciente"
                      readOnly={isViewMode}
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </CustomFormItem>
                </Col>

                <Col xs={24} sm={12}>
                  <CustomFormItem label="DNI/Cédula" name="dni">
                    <CustomInput
                      placeholder="000-0000000-0"
                      readOnly={isViewMode}
                      prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </CustomFormItem>
                </Col>

                <Col xs={24} sm={12}>
                  <CustomFormItem label="Teléfono" name="phone">
                    <CustomInput
                      placeholder="809-000-0000"
                      readOnly={isViewMode}
                      prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </CustomFormItem>
                </Col>

                <Col xs={24} sm={12}>
                  <CustomFormItem label="Pasaporte" name="passport">
                    <CustomInput
                      placeholder="000-000000-00"
                      readOnly={isViewMode}
                      prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </CustomFormItem>{' '}
                </Col>
              </Row>

              <Divider orientation="left">
                <Space size="small">
                  <SafetyOutlined />
                  <Text>Seguro Médico</Text>
                </Space>
              </Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <CustomFormItem label="Compañía de Seguro" name="insurance_id">
                    <CustomSelect
                      placeholder="Seleccionar seguro"
                      showSearch
                      optionFilterProp="children"
                      loading={loadingInsurances}
                      readOnly={isViewMode}
                      onChange={handleInsuranceChange}
                    >
                      {insurances.map((insurance) => (
                        <Option key={insurance.id} value={insurance.id}>
                          {insurance.name}
                        </Option>
                      ))}
                    </CustomSelect>
                  </CustomFormItem>
                </Col>

                <Col xs={24} sm={12}>
                  <CustomFormItem label="Código de Seguro" name="insurance_code">
                    <CustomInput
                      placeholder="Código del paciente"
                      readOnly={isViewMode || !editInsuranceCode}
                    />
                  </CustomFormItem>
                </Col>
              </Row>
            </Card>

            {/* Sección 2: Especialista */}
            <Card
              title={
                <Space>
                  <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                  <span>Especialista</span>
                </Space>
              }
              style={{ marginBottom: isMobile ? 16 : 24 }}
              bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
            >
              {selectedEmployeeData && (
                <Alert
                  message={
                    <Text strong>
                      Dr(a). {selectedEmployeeData.firstname} {selectedEmployeeData.lastname}
                    </Text>
                  }
                  description={
                    selectedEmployeeData.position && (
                      <Tag color="blue">{selectedEmployeeData.position.name}</Tag>
                    )
                  }
                  type="info"
                  showIcon
                  icon={<MedicineBoxOutlined />}
                  style={{ marginBottom: 16 }}
                />
              )}

              <CustomFormItem label="Seleccione el Profesional" name="employee_id" required>
                <CustomSelect
                  placeholder="Buscar especialista..."
                  showSearch
                  optionFilterProp="children"
                  loading={loadingEmployees}
                  readOnly={isViewMode}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {employees.map((employee) => (
                    <Option key={employee.id} value={employee.id}>
                      Dr(a). {employee.firstname} {employee.lastname}
                      {employee.position && !isMobile && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {' '}
                          - {employee.position.name}
                        </Text>
                      )}
                    </Option>
                  ))}
                </CustomSelect>
              </CustomFormItem>
            </Card>

            {/* Sección 3: Fecha y Hora */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#faad14' }} />
                  <span>Fecha y Horario</span>
                </Space>
              }
              style={{ marginBottom: isMobile ? 16 : 24 }}
              bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={8}>
                  <CustomButton
                    icon={<ClockCircleOutlined />}
                    onClick={() => setIsTimePickerOpen(true)}
                  >
                    📅 Elegir Horario Visualmente
                  </CustomButton>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <CustomFormItem label="Fecha de la Cita" name="appointment_date" required>
                    <CustomDatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder="Seleccionar fecha"
                      disabledDate={(current: Dayjs) => current && current < dayjs().startOf('day')}
                      readOnly={isViewMode}
                    />
                  </CustomFormItem>
                </Col>

                <Col xs={12} sm={12} md={8}>
                  <CustomFormItem label="Hora Inicio" name="start_time" required>
                    <CustomTimePicker
                      style={{ width: '100%' }}
                      placeholder="HH:mm"
                      format="HH:mm"
                      minuteStep={15}
                      readOnly={isViewMode}
                    />
                  </CustomFormItem>
                </Col>

                <Col xs={12} sm={12} md={8}>
                  <CustomFormItem label="Hora Fin" name="end_time" required>
                    <CustomTimePicker
                      style={{ width: '100%' }}
                      placeholder="HH:mm"
                      format="HH:mm"
                      minuteStep={15}
                      disabled={!startTime}
                      readOnly={isViewMode}
                    />
                  </CustomFormItem>
                </Col>
              </Row>

              {appointmentDate && startTime && (
                <Alert
                  message={
                    <Text strong>
                      {appointmentDate.format('dddd, DD [de] MMMM')} a las{' '}
                      {startTime.format('HH:mm')}
                    </Text>
                  }
                  type="info"
                  showIcon
                  icon={<CalendarOutlined />}
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            {/* Sección 4: Notas */}
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#722ed1' }} />
                  <span>Observaciones</span>
                </Space>
              }
              style={{ marginBottom: isMobile ? 16 : 24 }}
              bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
            >
              <CustomFormItem label="Notas adicionales (opcional)" name="notes">
                <CustomInput.TextArea
                  rows={4}
                  placeholder="Agregar información relevante sobre la cita..."
                  readOnly={isViewMode}
                />
              </CustomFormItem>
            </Card>

            {/* Botones en móvil - abajo del formulario */}
            {isMobile && !isViewMode && (
              <Card bodyStyle={{ padding: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <CustomButton
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    icon={<SaveOutlined />}
                    block
                    size="large"
                  >
                    {mode === 'create' ? 'Crear Cita' : 'Actualizar Cita'}
                  </CustomButton>

                  <CustomButton
                    onClick={() => navigate('/consult-appointments')}
                    block
                    size="large"
                  >
                    Cancelar
                  </CustomButton>
                </Space>
              </Card>
            )}
          </Col>

          {/* Columna Derecha - Resumen (Solo Desktop) */}
          {!isMobile && (
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Resumen</span>
                  </Space>
                }
                style={{
                  position: 'sticky',
                  top: 24,
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  {/* Paciente */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      PACIENTE
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      {selectedPatient ? (
                        <>
                          <Text strong style={{ fontSize: 16 }}>
                            {selectedPatient.firstname} {selectedPatient.lastname}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedPatient.dni}
                          </Text>
                        </>
                      ) : (
                        <Text type="secondary">No seleccionado</Text>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  {/* Especialista */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ESPECIALISTA
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      {selectedEmployeeData ? (
                        <>
                          <Text strong style={{ fontSize: 16 }}>
                            Dr(a). {selectedEmployeeData.firstname} {selectedEmployeeData.lastname}
                          </Text>
                          <br />
                          {selectedEmployeeData.position && (
                            <Tag color="blue" style={{ marginTop: 4 }}>
                              {selectedEmployeeData.position.name}
                            </Tag>
                          )}
                        </>
                      ) : (
                        <Text type="secondary">No seleccionado</Text>
                      )}
                    </div>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  {/* Fecha y Hora */}
                  <CustomButton
                    type="primary"
                    icon={<ClockCircleOutlined />}
                    onClick={() => setIsTimePickerOpen(true)}
                    block={isMobile}
                    size="large"
                    style={{ marginTop: 16 }}
                  >
                    📅 Elegir Horario Visualmente
                  </CustomButton>

                  <Divider style={{ margin: '8px 0' }} />

                  {/* Botones Desktop */}
                  {!isViewMode && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <CustomButton
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        icon={<SaveOutlined />}
                        size="large"
                        block
                      >
                        {mode === 'create' ? 'Crear Cita' : 'Actualizar'}
                      </CustomButton>

                      <CustomButton onClick={() => navigate('/consult-appointments')} block>
                        Cancelar
                      </CustomButton>
                    </Space>
                  )}

                  {/* Tip */}
                  {validationError && (
                    <Alert
                      message="Horario no disponible"
                      description={validationError}
                      type="error"
                      showIcon
                      icon={<WarningOutlined />}
                      closable
                      onClose={clearValidationError}
                      style={{ marginBottom: 16 }}
                    />
                  )}
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </CustomForm>

      <PatientSelectorModal
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSelect={handlePatientSelect}
        selectedPatientId={selectedPatient?.id}
        title="Seleccionar Paciente para la Cita"
        allowClear={true}
      />

      <AppointmentTimePickerModal
        open={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        doctorId={selectedEmployee}
        doctorName={
          selectedEmployeeData
            ? `Dr(a). ${selectedEmployeeData.firstname} ${selectedEmployeeData.lastname}`
            : undefined
        }
        onTimeSelected={handleTimeSelected}
        duration={60}
        initialDate={appointmentDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')}
      />
    </div>
  )
}
