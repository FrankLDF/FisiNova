// src/features/consultation/pages/MedicDashboard.tsx
import { Card, Row, Col, Statistic, Table, Tag, Tabs, Space } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import consultationService from '../services/consultation'
import type { Appointment } from '../../appointment/models/appointment'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export const MedicDashboard = () => {
  const navigate = useNavigate()

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: consultationService.getDashboardStats,
    refetchInterval: 30000,
  })

  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ['appointments-pending'],
    queryFn: () => consultationService.getMyAppointments('confirmada'),
    refetchInterval: 30000,
  })

  const { data: inProgressData, isLoading: loadingProgress } = useQuery({
    queryKey: ['appointments-progress'],
    queryFn: () => consultationService.getMyAppointments('en_atencion'),
    refetchInterval: 30000,
  })

  const { data: completedData, isLoading: loadingCompleted } = useQuery({
    queryKey: ['appointments-completed'],
    queryFn: () => consultationService.getMyAppointments('completada'),
    refetchInterval: 60000,
  })

  const stats = statsData?.data || {
    pending: 0,
    in_progress: 0,
    completed_today: 0,
    total_today: 0,
  }

  const handleStartConsultation = (appointment: Appointment) => {
    navigate(`/consultation/${appointment.id}`)
  }

  const handleViewConsultation = (appointment: Appointment) => {
    navigate(`/consultation/${appointment.id}/view`)
  }

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Hora',
      width: 100,
      render: (_, record) => (
        <span style={{ fontSize: 13 }}>
          {dayjs(record.start_time, 'HH:mm').format('HH:mm')}
        </span>
      ),
    },
    {
      title: 'Paciente',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>
            {record.patient?.firstname} {record.patient?.lastname}
          </span>
          {record.patient?.dni && (
            <span style={{ fontSize: 12, color: '#666' }}>
              {record.patient.dni}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Tipo',
      width: 100,
      render: (_, record) => (
        <Tag color={record.type === 'therapy' ? 'blue' : 'green'}>
          {record.type === 'therapy' ? 'Terapia' : 'Consulta'}
        </Tag>
      ),
    },
    {
      title: 'Pago',
      width: 120,
      render: (_, record) => {
        const colors: Record<string, string> = {
          insurance: 'blue',
          private: 'orange',
          workplace_risk: 'purple',
        }
        const labels: Record<string, string> = {
          insurance: 'Seguro',
          private: 'Privada',
          workplace_risk: 'Riesgo Lab.',
        }
        return (
          <Tag color={colors[record.payment_type || ''] || 'default'}>
            {labels[record.payment_type || ''] || '-'}
          </Tag>
        )
      },
    },
    {
      title: 'Acciones',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === 'completada' ? (
            <CustomButton
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewConsultation(record)}
            >
              Ver
            </CustomButton>
          ) : (
            <CustomButton
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartConsultation(record)}
            >
              {record.status === 'en_atencion' ? 'Continuar' : 'Iniciar'}
            </CustomButton>
          )}
        </Space>
      ),
    },
  ]

  const pendingAppointments = pendingData?.data?.data || pendingData?.data || []
  const inProgressAppointments =
    inProgressData?.data?.data || inProgressData?.data || []
  const completedAppointments =
    completedData?.data?.data || completedData?.data || []

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]}>
        {/* Estadísticas */}
        <Col xs={24} sm={12} md={6}>
          <Card loading={loadingStats}>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loadingStats}>
            <Statistic
              title="En Atención"
              value={stats.in_progress}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loadingStats}>
            <Statistic
              title="Completadas Hoy"
              value={stats.completed_today}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loadingStats}>
            <Statistic
              title="Total Hoy"
              value={stats.total_today}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        {/* Tablas */}
        <Col span={24}>
          <Card>
            <Tabs
              defaultActiveKey="pending"
              items={[
                {
                  key: 'pending',
                  label: `Pendientes (${pendingAppointments.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={pendingAppointments}
                      loading={loadingPending}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5 }}
                    />
                  ),
                },
                {
                  key: 'progress',
                  label: `En Atención (${inProgressAppointments.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={inProgressAppointments}
                      loading={loadingProgress}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5 }}
                    />
                  ),
                },
                {
                  key: 'completed',
                  label: `Completadas (${completedAppointments.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={completedAppointments}
                      loading={loadingCompleted}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
