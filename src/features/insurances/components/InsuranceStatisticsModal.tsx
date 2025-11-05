// src/features/insurances/components/InsuranceStatisticsModal.tsx

import { Modal, Space, Card, Row, Col, Statistic, Tag, Skeleton } from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import insuranceService from '../services/insurance'

interface InsuranceStatisticsModalProps {
  insuranceId: number
  open: boolean
  onClose: () => void
}

export const InsuranceStatisticsModal: React.FC<
  InsuranceStatisticsModalProps
> = ({ insuranceId, open, onClose }) => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['insurance-statistics', insuranceId],
    queryFn: () => insuranceService.getStatistics(insuranceId),
    enabled: open && !!insuranceId,
  })

  const stats = statsData?.data

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          Estadísticas del Seguro
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {isLoading ? (
        <Skeleton active />
      ) : stats ? (
        <>
          {/* Información del Seguro */}
          <Card
            type="inner"
            style={{ marginBottom: 16, backgroundColor: '#f0f5ff' }}
          >
            <Row gutter={16} align="middle">
              <Col>
                <FileProtectOutlined
                  style={{ fontSize: 32, color: '#1890ff' }}
                />
              </Col>
              <Col flex={1}>
                <Space direction="vertical" size={0}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>
                    {stats.insurance.name}
                  </span>
                  <Tag color="blue">{stats.insurance.provider_code}</Tag>
                </Space>
              </Col>
              <Col>
                <Tag color={stats.insurance.active ? 'green' : 'red'}>
                  {stats.insurance.active ? 'Activo' : 'Inactivo'}
                </Tag>
              </Col>
            </Row>
          </Card>

          {/* Estadísticas de Pacientes */}
          <Card
            type="inner"
            title={
              <Space>
                <UserOutlined />
                <span>Pacientes</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Total de Pacientes"
                  value={stats.patients.total}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Pacientes Activos"
                  value={stats.patients.active}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Estadísticas de Citas */}
          <Card
            type="inner"
            title={
              <Space>
                <CalendarOutlined />
                <span>Citas Médicas</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total"
                  value={stats.appointments.total}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Pendientes"
                  value={stats.appointments.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Completadas"
                  value={stats.appointments.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Canceladas"
                  value={stats.appointments.cancelled}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Estadísticas de Autorizaciones */}
          <Card
            type="inner"
            title={
              <Space>
                <FileProtectOutlined />
                <span>Autorizaciones</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total"
                  value={stats.authorizations.total}
                  prefix={<FileProtectOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Activas"
                  value={stats.authorizations.active}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Con Sesiones Pendientes"
                  value={stats.authorizations.with_pending_sessions}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Actividad Reciente */}
          {(stats.recent_activity.last_appointment ||
            stats.recent_activity.last_authorization) && (
            <Card type="inner" title="Actividad Reciente">
              <Row gutter={16}>
                {stats.recent_activity.last_appointment && (
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" size={0}>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        Última Cita:
                      </span>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(
                          stats.recent_activity.last_appointment
                        ).toLocaleString('es-DO')}
                      </span>
                    </Space>
                  </Col>
                )}
                {stats.recent_activity.last_authorization && (
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" size={0}>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        Última Autorización:
                      </span>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(
                          stats.recent_activity.last_authorization
                        ).toLocaleString('es-DO')}
                      </span>
                    </Space>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          No hay estadísticas disponibles
        </div>
      )}
    </Modal>
  )
}
