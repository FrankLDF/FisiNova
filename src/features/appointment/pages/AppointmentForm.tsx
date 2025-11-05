import {
  Card,
  Row,
  Col,
  Form,
  Grid,
  Skeleton,
  Space,
  Tag,
  Alert,
  Typography,
  Select,
  Input,
  DatePicker,
  TimePicker,
  Button,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import appointmentService from '../services/appointment'
import { PatientSelectorModal } from '../../../components/modals/PatientSelectorModal'
import { CalendarAvailabilityModal } from '../components/CalendarAvailabilityModal'
import dayjs from 'dayjs'
import type { Patient } from '../../patient/models/patient'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'
import { Positions } from '../../../utils/constants'
import { useAppointmentAvailability } from '../hooks/useAppointmentAvailability'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/form/CustomInput'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

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
  const isMobile = !screens.md

  // Estados locales
  const [employees, setEmployees] = useState<Employee[]>([])
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [loadingInsurances, setLoadingInsurances] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [mode, setMode] = useState<FormMode>('create')

  // Valores del formulario
  const selectedEmployee = Form.useWatch('employee_id', form)
  const appointmentDate = Form.useWatch('appointment_date', form)
  const startTime = Form.useWatch('start_time', form)

  // Hook de disponibilidad
  const { validateSlot, validationError, clearValidationError, getNextAvailable } =
    useAppointmentAvailability(
      selectedEmployee || null,
      appointmentDate?.format('YYYY-MM-DD'),
      appointmentDate?.format('YYYY-MM-DD')
    )

  // Determinar modo
  useEffect(() => {
    if (id) {
      setMode(window.location.pathname.includes('/edit') ? 'edit' : 'view')
    } else {
      setMode('create')
    }
  }, [id])

  // Cargar cita si estamos editando/viendo
  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointment(Number(id)),
    enabled: !!id,
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadEmployees()
    loadInsurances()
  }, [])

  // Poblar formulario cuando se carga la cita
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
        insurance_id: appointment.insurance_id || appointment.patient?.insurance?.id,
      })
    }
  }, [appointmentData, form, id])

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await appointmentService.getEmployees({ position_id: Positions.MEDIC })
      const employeeData = response?.data?.data || response?.data || []
      setEmployees(Array.isArray(employeeData) ? employeeData : [])
    } catch (error) {
      showNotification({ type: 'error', message: 'Error al cargar empleados' })
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true)
      const response = await appointmentService.getAvailableInsuranceCompanies()
      const insuranceData = response?.data?.data || response?.data || []
      setInsurances(Array.isArray(insuranceData) ? insuranceData : [])
    } catch (error) {
      showNotification({ type: 'error', message: 'Error al cargar seguros' })
      setInsurances([])
    } finally {
      setLoadingInsurances(false)
    }
  }

  // Mutations
  const { mutate: createAppointment, isPending: isCreating } = useCustomMutation({
    execute: appointmentService.createAppointment,
    onSuccess: () => {
      showNotification({ type: 'success', message: 'Cita creada exitosamente' })
      navigate('/consult-appointments')
    },
    onError: showHandleError,
  })

  const { mutate: updateAppointment, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      appointmentService.updateAppointment(id, data),
    onSuccess: () => {
      showNotification({ type: 'success', message: 'Cita actualizada exitosamente' })
      navigate('/consult-appointments')
    },
    onError: showHandleError,
  })

  // Handlers
  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient)
    if (patient) {
      form.setFieldsValue({
        guest_firstname: patient.firstname,
        guest_lastname: patient.lastname,
        dni: patient.dni,
        phone: patient.phone,
        insurance_id: patient.insurance?.id,
        insurance_code: patient.insurance_code,
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
    setIsCalendarModalOpen(false)
  }

  const handleManualTimeChange = async () => {
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

  const onFinish = async (values: any) => {
    try {
      // Validar horario antes de enviar
      if (values.appointment_date && values.start_time && selectedEmployee) {
        const validation = await validateSlot(
          values.appointment_date.format('YYYY-MM-DD'),
          values.start_time.format('HH:mm'),
          id ? Number(id) : undefined
        )

        if (validation && !validation.is_available) {
          showNotification({ type: 'error', message: 'El horario no está disponible' })
          return
        }
      }

      const appointmentData = {
        ...values,
        patient_id: selectedPatient?.id || null,
        appointment_date: values.appointment_date?.format('YYYY-MM-DD'),
        start_time: values.start_time?.format('HH:mm'),
        end_time: values.end_time?.format('HH:mm'),
      }

      if (mode === 'create') {
        createAppointment(appointmentData)
      } else if (mode === 'edit' && id) {
        updateAppointment({ id: Number(id), data: appointmentData })
      }
    } catch (error) {
      showNotification({ type: 'error', message: 'Error procesando la cita' })
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
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/consult-appointments')}
                >
                  Volver
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                  {mode === 'create' ? 'Nueva Cita' : mode === 'edit' ? 'Editar Cita' : 'Ver Cita'}
                </Title>
              </Space>
            </Col>
          </Row>

          {/* Alert de validación */}
          {validationError && (
            <Alert
              message="Horario no disponible"
              description={validationError}
              type="error"
              showIcon
              icon={<WarningOutlined />}
              closable
              onClose={clearValidationError}
            />
          )}

          {/* Formulario */}
          <Form form={form} layout="vertical" onFinish={onFinish} disabled={isViewMode}>
            <Row gutter={[16, 16]}>
              {/* Sección de Paciente */}
              <Col xs={24}>
                <Card
                  title={
                    <Space>
                      <UserOutlined /> Información del Paciente
                    </Space>
                  }
                  size="small"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Button
                        type="dashed"
                        block
                        onClick={() => setIsPatientModalOpen(true)}
                        disabled={isViewMode}
                      >
                        {selectedPatient
                          ? `Paciente: ${selectedPatient.firstname} ${selectedPatient.lastname}`
                          : 'Seleccionar Paciente (Opcional)'}
                      </Button>
                    </Col>

                    <Col xs={24} sm={12}>
                      <CustomFormItem
                        label="Nombre"
                        name="guest_firstname"
                        rules={[{ required: true, message: 'Nombre requerido' }]}
                      >
                        <CustomInput placeholder="Nombre del paciente" />
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} sm={12}>
                      <CustomFormItem
                        label="Apellido"
                        name="guest_lastname"
                        rules={[{ required: true, message: 'Apellido requerido' }]}
                      >
                        <CustomInput placeholder="Apellido del paciente" />
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} sm={12}>
                      <CustomFormItem label="DNI" name="dni">
                        <CustomInput placeholder="Documento de identidad" />
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} sm={12}>
                      <CustomFormItem label="Teléfono" name="phone">
                        <CustomInput placeholder="Número de contacto" />
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} sm={12}>
                      <CustomFormItem label="Seguro Médico" name="insurance_id">
                        <Select
                          placeholder="Seleccionar seguro"
                          loading={loadingInsurances}
                          allowClear
                        >
                          {insurances.map((insurance) => (
                            <Option key={insurance.id} value={insurance.id}>
                              {insurance.name}
                            </Option>
                          ))}
                        </Select>
                      </CustomFormItem>
                    </Col>
                    <Col xs={24} sm={12}>
                      <CustomFormItem label="Código de Seguro" name="insurance_code">
                        <CustomInput placeholder="Código de seguro" />
                      </CustomFormItem>{' '}
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Sección de Cita */}
              <Col xs={24}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined /> Detalles de la Cita
                    </Space>
                  }
                  size="small"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Form.Item
                        label="Doctor/Especialista"
                        name="employee_id"
                        rules={[{ required: true, message: 'Seleccione un doctor' }]}
                      >
                        <Select
                          placeholder="Seleccionar doctor"
                          loading={loadingEmployees}
                          showSearch
                          optionFilterProp="children"
                        >
                          {employees.map((emp) => (
                            <Option key={emp.id} value={emp.id}>
                              Dr(a). {emp.firstname} {emp.lastname}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    {selectedEmployee && !isViewMode && (
                      <Col xs={24}>
                        <Space wrap>
                          <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => setIsCalendarModalOpen(true)}
                          >
                            Ver Calendario de Disponibilidad
                          </Button>
                        </Space>
                      </Col>
                    )}

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Fecha"
                        name="appointment_date"
                        rules={[{ required: true, message: 'Fecha requerida' }]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          placeholder="Seleccionar fecha"
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Hora Inicio"
                        name="start_time"
                        rules={[{ required: true, message: 'Hora requerida' }]}
                      >
                        <TimePicker
                          style={{ width: '100%' }}
                          format="HH:mm"
                          minuteStep={15}
                          placeholder="Hora de inicio"
                          onChange={handleManualTimeChange}
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Hora Fin"
                        name="end_time"
                        rules={[{ required: true, message: 'Hora fin requerida' }]}
                      >
                        <TimePicker
                          style={{ width: '100%' }}
                          format="HH:mm"
                          minuteStep={15}
                          placeholder="Hora de fin"
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item label="Notas" name="notes">
                        <TextArea rows={4} placeholder="Notas adicionales sobre la cita" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Botones de acción */}
              {!isViewMode && (
                <Col xs={24}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={() => navigate('/consult-appointments')}>Cancelar</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                      icon={<SaveOutlined />}
                    >
                      {mode === 'create' ? 'Crear Cita' : 'Actualizar Cita'}
                    </Button>
                  </Space>
                </Col>
              )}
            </Row>
          </Form>
        </Space>
      </Card>

      {/* Modales */}
      <PatientSelectorModal
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSelect={handlePatientSelect}
        selectedPatientId={selectedPatient?.id}
        title="Seleccionar Paciente"
        allowClear
      />

      <CalendarAvailabilityModal
        open={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        doctorId={selectedEmployee}
        doctorName={
          selectedEmployeeData
            ? `Dr(a). ${selectedEmployeeData.firstname} ${selectedEmployeeData.lastname}`
            : undefined
        }
        onTimeSelected={handleTimeSelected}
        initialDate={appointmentDate?.format('YYYY-MM-DD')}
      />
    </div>
  )
}
