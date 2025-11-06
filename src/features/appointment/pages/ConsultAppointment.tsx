// src/features/appointment/pages/ConsultAppointment.tsx (actualizado)
import {
  Card,
  Table,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import appointmentService from '../services/appointment'
import authorizationService from '../../authorization/services/authorization'
import consultationService from '../../consultation/services/consultation'
import type { Appointment, AppointmentFilters } from '../models/appointment'
import type { ConfirmAppointmentRequest } from '../../authorization/models/authorization'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { showHandleError } from '../../../utils/handleError'
import { useAuth } from '../../../store/auth/AuthContext'
import { isAdmin, isSecretary } from '../../../utils/authFunctions'
import { ConfirmAppointmentModal } from '../components/ConfirmAppointmentModal'
import { AuthorizeTherapyModal } from '../components/AuthorizeTherapyModal'

const { RangePicker } = DatePicker
const { Option } = Select

export const ConsultAppointments = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<AppointmentFilters>({
    paginate: 15,
  })
  const { user } = useAuth()

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [authorizeTherapyModalOpen, setAuthorizeTherapyModalOpen] =
    useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [medicalRecord, setMedicalRecord] = useState<any>(null)

  if (user && !(isAdmin(user.rols) || isSecretary(user.rols))) {
    filters.employee_id = user.id
  }

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  )

  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  )
  const [selectedActive, setSelectedActive] = useState<string | undefined>(
    undefined
  )

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentService.getAppointments(filters),
  })

  const { data: insurancesData } = useQuery({
    queryKey: ['insurances-active'],
    queryFn: () => appointmentService.getAvailableInsuranceCompanies(),
  })

  const insurances = insurancesData?.data?.data || insurancesData?.data || []

  const { mutate: deleteAppointment } = useCustomMutation({
    execute: appointmentService.deleteAppointment,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Cita eliminada exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: confirmAppointment, isPending: isConfirming } =
    useCustomMutation({
      execute: ({
        id,
        data,
      }: {
        id: number
        data: ConfirmAppointmentRequest
      }) => authorizationService.confirmAppointment(id, data),
      onSuccess: () => {
        showNotification({
          type: 'success',
          message: 'Cita confirmada exitosamente',
        })
        setConfirmModalOpen(false)
        setSelectedAppointment(null)
        refetch()
      },
      onError: (err) => {
        showHandleError(err)
      },
    })

  const { mutate: authorizeTherapy, isPending: isAuthorizingTherapy } =
    useCustomMutation({
      execute: ({ id, data }: { id: number; data: any }) =>
        authorizationService.authorizeTherapy(id, data),
      onSuccess: () => {
        showNotification({
          type: 'success',
          message: 'Terapias autorizadas y citas generadas exitosamente',
        })
        setAuthorizeTherapyModalOpen(false)
        setSelectedAppointment(null)
        setMedicalRecord(null)
        refetch()
      },
      onError: (err) => {
        showHandleError(err)
      },
    })

  const statusColors: Record<string, string> = {
    programada: 'blue',
    confirmada: 'warning',
    completada: 'success',
    cancelada: 'error',
    pendiente_autorizacion: 'orange',
  }

  const getStatusColor = (status?: string) => {
    return status ? statusColors[status] || 'default' : 'default'
  }

  const handleViewAppointment = (appointmentId: number) => {
    navigate(`/appointments/${appointmentId}`)
  }

  const handleEditAppointment = (appointmentId: number) => {
    navigate(`/appointments/${appointmentId}/edit`)
  }

  const handleCreateAppointment = () => {
    navigate('/create-appointment')
  }

  const handleDeleteAppointment = (appointmentId: number) => {
    deleteAppointment(appointmentId)
  }

  const handleOpenConfirmModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setConfirmModalOpen(true)
  }

  const handleConfirmAppointment = (data: ConfirmAppointmentRequest) => {
    if (selectedAppointment?.id) {
      confirmAppointment({
        id: selectedAppointment.id,
        data,
      })
    }
  }

  const handleOpenAuthorizeTherapyModal = async (appointment: Appointment) => {
    try {
      const record = await consultationService.getMedicalRecord(appointment.id!)
      console.log(record?.data)
      setMedicalRecord(record?.data)
      setSelectedAppointment(appointment)
      setAuthorizeTherapyModalOpen(true)
    } catch (error) {
      showHandleError(error)
    }
  }

  const handleAuthorizeTherapy = (data: any) => {
    if (selectedAppointment?.id) {
      authorizeTherapy({
        id: selectedAppointment.id,
        data,
      })
    }
  }

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Fecha',
      dataIndex: 'appointment_date',
      key: 'appointment_date',
      render: (date: string) => {
        if (!date) return '-'
        return dayjs(date).format('DD/MM/YYYY')
      },
      sorter: true,
    },
    {
      title: 'Hora',
      key: 'time',
      render: (_, record) => {
        const startTime = record.start_time
          ? dayjs(record.start_time, 'HH:mm').format('HH:mm')
          : '--:--'
        const endTime = record.end_time
          ? dayjs(record.end_time, 'HH:mm').format('HH:mm')
          : '--:--'

        return (
          <span>
            {startTime} - {endTime}
          </span>
        )
      },
    },
    {
      title: 'Profesional',
      key: 'employee',
      render: (_, record) => (
        <span>
          {record.employee
            ? `${record.employee.firstname || ''} ${
                record.employee.lastname || ''
              }`
            : 'Sin asignar'}
        </span>
      ),
    },
    {
      title: 'Paciente',
      key: 'patient',
      render: (_, record) => (
        <span>
          {record.patient
            ? `${record.patient.firstname || ''} ${
                record.patient.lastname || ''
              }`
            : record.guest_firstname || record.guest_lastname
            ? `Nuevo: ${record.guest_firstname} ${record.guest_lastname}`
            : 'Sin asignar'}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'therapy' ? 'blue' : 'green'}>
          {type === 'therapy' ? 'Terapia' : 'Consulta'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {user && (isAdmin(user.rols) || isSecretary(user.rols)) && (
            <>
              {record.status === 'programada' && (
                <Tooltip title="Confirmar Entrada">
                  <CustomButton
                    type="text"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleOpenConfirmModal(record)}
                  />
                </Tooltip>
              )}

              {record.status === 'completada' &&
                record.type === 'consultation' && (
                  <Tooltip title="Autorizar Terapias">
                    <CustomButton
                      type="text"
                      icon={<FileProtectOutlined />}
                      onClick={() => handleOpenAuthorizeTherapyModal(record)}
                      style={{ color: '#1890ff' }}
                    />
                  </Tooltip>
                )}
            </>
          )}

          <Tooltip title="Ver detalles">
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewAppointment(record.id!)}
            />
          </Tooltip>

          {user && (isAdmin(user.rols) || isSecretary(user.rols)) && (
            <>
              <Tooltip title="Editar">
                <CustomButton
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditAppointment(record.id!)}
                  disabled={
                    record.status === 'completada' ||
                    record.status === 'cancelada'
                  }
                />
              </Tooltip>

              <CustomConfirm
                title="¿Estás seguro de eliminar esta cita?"
                description="Esta acción no se puede deshacer"
                onConfirm={() => handleDeleteAppointment(record.id!)}
                okText="Sí, eliminar"
                cancelText="Cancelar"
              >
                <Tooltip title="Eliminar">
                  <CustomButton
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={
                      record.status === 'completada' ||
                      record.status === 'cancelada'
                    }
                  />
                </Tooltip>
              </CustomConfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({ paginate: 15 })
    setDateRange(null)
    setSelectedStatus(undefined)
    setSelectedActive(undefined)
  }

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      // Rango válido
      const start = dates[0].startOf('day')
      const end = dates[1].endOf('day')

      setDateRange([start, end])
      setFilters((prev) => ({
        ...prev,
        start_date: start.format('YYYY-MM-DD'),
        end_date: end.format('YYYY-MM-DD'),
      }))
    } else {
      // Limpieza del rango
      setDateRange(null)
      setFilters((prev) => {
        const newFilters = { ...prev }
        delete newFilters.start_date
        delete newFilters.end_date
        return newFilters
      })
    }
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    handleFilterChange('status', value)
  }

  const handleActiveChange = (value: string) => {
    setSelectedActive(value)
    handleFilterChange('active', value)
  }

  const tableData = appointmentsData?.data?.data || appointmentsData?.data || []
  const pagination = {
    current: appointmentsData?.data?.current_page || 1,
    pageSize: appointmentsData?.data?.per_page || filters.paginate || 15,
    total: appointmentsData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} citas`,
    onChange: (page: number, size?: number) => {
      handleFilterChange('paginate', size)
    },
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Filtros de Búsqueda">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Rango de fechas:</label>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Estado:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Seleccionar estado"
                  allowClear
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  <Option value="programada">Programada</Option>
                  <Option value="confirmada">Confirmada</Option>
                  <Option value="pendiente_autorizacion">Pendiente Autorización</Option>
                  <Option value="completada">Completada</Option>
                  <Option value="cancelada">Cancelada</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Activo:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Estado"
                  allowClear
                  value={selectedActive}
                  onChange={handleActiveChange}
                >
                  <Option value="true">Activo</Option>
                  <Option value="false">Inactivo</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <CustomButton type="default" onClick={clearFilters}>
                    Limpiar Filtros
                  </CustomButton>
                </Space>
              </Col>

              {user && (isAdmin(user.rols) || isSecretary(user.rols)) && (
                <Col xs={24} sm={12} md={8} lg={4}>
                  <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateAppointment()}
                    style={{ width: '100%' }}
                  >
                    Nueva Cita
                  </CustomButton>
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Lista de Citas">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              rowKey="id"
              pagination={pagination}
              scroll={{ x: 1500 }}
            />
          </Card>
        </Col>
      </Row>

      <ConfirmAppointmentModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false)
          setSelectedAppointment(null)
        }}
        onConfirm={handleConfirmAppointment}
        appointment={selectedAppointment}
        insurances={insurances}
        loading={isConfirming}
      />

      <AuthorizeTherapyModal
        open={authorizeTherapyModalOpen}
        onClose={() => {
          setAuthorizeTherapyModalOpen(false)
          setSelectedAppointment(null)
          setMedicalRecord(null)
        }}
        onConfirm={handleAuthorizeTherapy}
        appointment={selectedAppointment}
        insurances={insurances}
        loading={isAuthorizingTherapy}
        medicalRecord={medicalRecord}
      />
    </div>
  )
}
