import { Card, Table, Row, Col, Select, Space, Tag, Tooltip } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import staffService from '../services/staff'
import type {
  StaffSchedule,
  StaffScheduleFilters,
  Staff,
} from '../models/staff'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'
import { DAY_OF_WEEK_MAP } from '../models/staff'
import dayjs from 'dayjs'

const { Option } = Select

export const ConsultStaffSchedules = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<StaffScheduleFilters>({
    paginate: 15,
    status: 'active',
  })

  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoadingStaff(true)
      const response = await staffService.getStaff({ is_active: true })
      const staffData = response?.data?.data || response?.data || []
      setStaffList(Array.isArray(staffData) ? staffData : [])
    } catch (error) {
      console.error('Error cargando personal:', error)
      setStaffList([])
    } finally {
      setLoadingStaff(false)
    }
  }

  const {
    data: schedulesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['staff-schedules', filters],
    queryFn: () => staffService.getStaffSchedules(filters),
  })

  const { mutate: deleteSchedule } = useCustomMutation({
    execute: staffService.deleteStaffSchedule,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Asignación eliminada exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleCreateAssignment = () => {
    navigate('/assign-schedule')
  }

  const handleDeleteSchedule = (scheduleId: number) => {
    deleteSchedule(scheduleId)
  }

  const columns: ColumnsType<StaffSchedule> = [
    {
      title: 'Personal',
      key: 'staff',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>
            {record.staff
              ? `${record.staff.first_name} ${record.staff.last_name}`
              : 'Sin asignar'}
          </span>
          {record.staff?.position && (
            <Tag color="blue" style={{ fontSize: 11 }}>
              {record.staff.position.name}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Horario',
      key: 'schedule',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.schedule_day && (
            <>
              <span>
                {record.schedule_day.day_of_week
                  ? DAY_OF_WEEK_MAP[record.schedule_day.day_of_week]
                  : 'Flexible'}
              </span>
              <span style={{ fontSize: 12, color: '#666' }}>
                {record.schedule_day.start_time} -{' '}
                {record.schedule_day.end_time}
              </span>
            </>
          )}
          {record.schedule_day?.schedule_template && (
            <Tag color="cyan" style={{ fontSize: 11 }}>
              {record.schedule_day.schedule_template.name}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Cubículo',
      key: 'cubicle',
      render: (_, record) =>
        record.cubicle ? (
          <Tooltip title={record.cubicle.location}>
            <Tag color="green">{record.cubicle.name}</Tag>
          </Tooltip>
        ) : (
          <Tag>Sin cubículo</Tag>
        ),
    },
    {
      title: 'Tipo',
      key: 'type',
      render: (_, record) =>
        record.assignment_date ? (
          <Space direction="vertical" size={0}>
            <Tag color="orange">Específico</Tag>
            <span style={{ fontSize: 11 }}>
              {dayjs(record.assignment_date).format('DD/MM/YYYY')}
            </span>
            {record.end_date && (
              <span style={{ fontSize: 11 }}>
                hasta {dayjs(record.end_date).format('DD/MM/YYYY')}
              </span>
            )}
          </Space>
        ) : (
          <Tag color="purple">Recurrente</Tag>
        ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          cancelled: 'red',
          completed: 'blue',
        }
        const labels: Record<string, string> = {
          active: 'Activo',
          cancelled: 'Cancelado',
          completed: 'Completado',
        }
        return (
          <Tag color={colors[status] || 'default'}>
            {labels[status] || status}
          </Tag>
        )
      },
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string) =>
        notes ? (
          <Tooltip title={notes}>
            <span>
              {notes.length > 30 ? notes.substring(0, 30) + '...' : notes}
            </span>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <CustomConfirm
            title="¿Estás seguro de eliminar esta asignación?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteSchedule(record.id!)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Tooltip title="Eliminar">
              <CustomButton
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </CustomConfirm>
        </Space>
      ),
    },
  ]

  const handleFilterChange = (key: keyof StaffScheduleFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({ paginate: 15, status: 'active' })
  }

  const tableData = schedulesData?.data?.data || schedulesData?.data || []
  const pagination = {
    current: schedulesData?.data?.current_page || 1,
    pageSize: schedulesData?.data?.per_page || filters.paginate || 15,
    total: schedulesData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} asignaciones`,
    onChange: (page: number, size?: number) => {
      handleFilterChange('paginate', size)
    },
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Filtros de Búsqueda">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Personal:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Filtrar por personal"
                  allowClear
                  loading={loadingStaff}
                  showSearch
                  optionFilterProp="children"
                  value={filters.staff_id}
                  onChange={(value) => handleFilterChange('staff_id', value)}
                >
                  {staffList.map((staff) => (
                    <Option key={staff.id} value={staff.id!}>
                      {`${staff.first_name} ${staff.last_name}`}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Estado:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Estado"
                  allowClear
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                >
                  <Option value="active">Activo</Option>
                  <Option value="cancelled">Cancelado</Option>
                  <Option value="completed">Completado</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Tipo:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Tipo"
                  allowClear
                  value={filters.is_recurring?.toString()}
                  onChange={(value) =>
                    handleFilterChange('is_recurring', value)
                  }
                >
                  <Option value="true">Recurrente</Option>
                  <Option value="false">Específico</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <CustomButton type="default" onClick={clearFilters}>
                    Limpiar Filtros
                  </CustomButton>
                </Space>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <CustomButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAssignment}
                  style={{ width: '100%' }}
                >
                  Asignar Horario
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Asignaciones de Horarios">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              rowKey="id"
              pagination={pagination}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
