import { Card, Row, Col, Statistic, Table, Tag, Tabs, Space, DatePicker } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { CustomButton } from '../../../components/Button/CustomButton'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { StartTherapySessionModal } from '../components/StartTherapySessionModal'
import { CompleteTherapySessionModal } from '../components/CompleteTherapySessionModal'
import therapyService from '../services/therapy'
import { showNotification } from '../../../utils/showNotification'

export const TherapistDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [therapies, setTherapies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTherapy, setSelectedTherapy] = useState<any | null>(null)
  const [startModalOpen, setStartModalOpen] = useState(false)
  const [completeModalOpen, setCompleteModalOpen] = useState(false)

  useEffect(() => {
    loadTherapies()
  }, [selectedDate])

  const loadTherapies = async () => {
    try {
      setLoading(true)
      const response = await therapyService.getMyTherapies(selectedDate.format('YYYY-MM-DD'))
      setTherapies(response?.data || [])
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: 'Error al cargar terapias',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar terapias por estado
  const pendingTherapies = therapies.filter((t) => t.status === 'confirmada')
  const inProgressTherapies = therapies.filter((t) => t.status === 'en_atencion')
  const completedTherapies = therapies.filter((t) => t.status === 'completada')

  // Estadísticas
  const stats = {
    pending: pendingTherapies.length,
    inProgress: inProgressTherapies.length,
    completedToday: completedTherapies.length,
    totalToday: therapies.length,
  }

  const handleStartTherapy = (therapy: any) => {
    setSelectedTherapy(therapy)
    setStartModalOpen(true)
  }

  const handleCompleteTherapy = (therapy: any) => {
    setSelectedTherapy(therapy)
    setCompleteModalOpen(true)
  }

  const handleSessionSuccess = () => {
    setStartModalOpen(false)
    setCompleteModalOpen(false)
    setSelectedTherapy(null)
    loadTherapies() // Recargar lista
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Hora',
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            {dayjs(record.start_time, 'HH:mm:ss').format('HH:mm')}
          </Tag>
          <span style={{ fontSize: 11, color: '#999' }}>
            {dayjs(record.end_time, 'HH:mm:ss').format('HH:mm')}
          </span>
        </Space>
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
            <span style={{ fontSize: 12, color: '#666' }}>{record.patient.dni}</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Sesión',
      width: 100,
      render: (_, record) => (
        <Tag color="purple">
          {record.session_number}/{record.total_sessions}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      width: 150,
      render: (_, record) => {
        const statusConfig: any = {
          confirmada: { color: 'blue', text: 'Pendiente', icon: <ClockCircleOutlined /> },
          en_atencion: { color: 'orange', text: 'En Progreso', icon: <FireOutlined /> },
          completada: { color: 'green', text: 'Completada', icon: <CheckCircleOutlined /> },
        }
        const config = statusConfig[record.status] || statusConfig.confirmada

        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: 'Acciones',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === 'confirmada' && (
            <CustomButton
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartTherapy(record)}
            >
              Iniciar
            </CustomButton>
          )}
          {record.status === 'en_atencion' && (
            <CustomButton
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteTherapy(record)}
            >
              Completar
            </CustomButton>
          )}
          {record.status === 'completada' && (
            <CustomButton type="default" size="small" icon={<EyeOutlined />}>
              Ver
            </CustomButton>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Selector de fecha */}
        <Card>
          <Space>
            <span style={{ fontWeight: 500 }}>Fecha:</span>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD/MM/YYYY"
              allowClear={false}
            />
          </Space>
        </Card>

        {/* Estadísticas */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pendientes"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="En Progreso"
                value={stats.inProgress}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Completadas Hoy"
                value={stats.completedToday}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total del Día" value={stats.totalToday} prefix={<UserOutlined />} />
            </Card>
          </Col>
        </Row>

        {/* Tabla de terapias */}
        <Card>
          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: 'all',
                label: `Todas (${therapies.length})`,
                children: (
                  <Table
                    columns={columns}
                    dataSource={therapies}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                  />
                ),
              },
              {
                key: 'pending',
                label: `Pendientes (${stats.pending})`,
                children: (
                  <Table
                    columns={columns}
                    dataSource={pendingTherapies}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                  />
                ),
              },
              {
                key: 'inProgress',
                label: `En Progreso (${stats.inProgress})`,
                children: (
                  <Table
                    columns={columns}
                    dataSource={inProgressTherapies}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                  />
                ),
              },
              {
                key: 'completed',
                label: `Completadas (${stats.completedToday})`,
                children: (
                  <Table
                    columns={columns}
                    dataSource={completedTherapies}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Space>

      {/* Modales */}
      <StartTherapySessionModal
        open={startModalOpen}
        onClose={() => {
          setStartModalOpen(false)
          setSelectedTherapy(null)
        }}
        onSuccess={handleSessionSuccess}
        therapy={selectedTherapy}
      />

      <CompleteTherapySessionModal
        open={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false)
          setSelectedTherapy(null)
        }}
        onSuccess={handleSessionSuccess}
        therapy={selectedTherapy}
      />
    </>
  )
}
