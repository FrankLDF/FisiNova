import { Modal, Row, Col, Button, Tag, Typography, Space, Spin, Alert, Divider } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { TimeSlot, DayAvailability } from '../services/appointmentAvailability'
import { useAppointmentAvailability } from '../../../hooks/useAppointmentAvailability'

dayjs.locale('es')

const { Text, Title } = Typography

interface AppointmentTimePickerModalProps {
  open: boolean
  onClose: () => void
  doctorId: number | null
  doctorName?: string
  onTimeSelected: (date: string, startTime: string, endTime: string) => void
  duration?: number
  initialDate?: string
}

export const AppointmentTimePickerModal: React.FC<AppointmentTimePickerModalProps> = ({
  open,
  onClose,
  doctorId,
  doctorName,
  onTimeSelected,
  duration = 60,
  initialDate,
}) => {
  const [weekStart, setWeekStart] = useState(dayjs(initialDate).startOf('week'))
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string
    startTime: string
    endTime: string
  } | null>(null)

  const weekEnd = weekStart.clone().endOf('week')

  const { availability, isLoading, totalAvailableSlots } = useAppointmentAvailability(
    doctorId,
    weekStart.format('YYYY-MM-DD'),
    weekEnd.format('YYYY-MM-DD'),
    duration
  )

  useEffect(() => {
    if (open && initialDate) {
      setWeekStart(dayjs(initialDate).startOf('week'))
    }
  }, [open, initialDate])

  const handleSlotClick = (day: DayAvailability, slot: TimeSlot) => {
    if (!slot.is_available) return

    setSelectedSlot({
      date: day.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
    })
  }

  const handleConfirm = () => {
    if (selectedSlot) {
      onTimeSelected(selectedSlot.date, selectedSlot.startTime, selectedSlot.endTime)
      setSelectedSlot(null)
      onClose()
    }
  }

  const handlePreviousWeek = () => {
    setWeekStart(weekStart.clone().subtract(1, 'week'))
    setSelectedSlot(null)
  }

  const handleNextWeek = () => {
    setWeekStart(weekStart.clone().add(1, 'week'))
    setSelectedSlot(null)
  }

  const handleToday = () => {
    setWeekStart(dayjs().startOf('week'))
    setSelectedSlot(null)
  }

  const getSlotStyle = (slot: TimeSlot, isSelected: boolean): React.CSSProperties => {
    if (isSelected) {
      return {
        backgroundColor: '#1890ff',
        color: 'white',
        border: '2px solid #096dd9',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
      }
    }

    if (!slot.is_available) {
      return {
        backgroundColor: '#f5f5f5',
        color: '#bfbfbf',
        border: '1px solid #d9d9d9',
        cursor: 'not-allowed',
      }
    }

    return {
      backgroundColor: '#f6ffed',
      color: '#52c41a',
      border: '1px solid #b7eb8f',
      cursor: 'pointer',
    }
  }

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Seleccionar Horario
            </Title>
            {doctorName && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {doctorName}
              </Text>
            )}
          </div>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={!selectedSlot}
          icon={<CheckCircleOutlined />}
        >
          Confirmar Horario
        </Button>,
      ]}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space size="middle">
            <Space size="small">
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 13 }}>Disponible</Text>
            </Space>
            <Space size="small">
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #d9d9d9',
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 13 }}>Ocupado</Text>
            </Space>
            <Space size="small">
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#1890ff',
                  border: '2px solid #096dd9',
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 13 }}>Seleccionado</Text>
            </Space>
          </Space>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button icon={<LeftOutlined />} onClick={handlePreviousWeek}>
            Anterior
          </Button>
        </Col>
        <Col>
          <Space direction="vertical" align="center" size={0}>
            <Title level={5} style={{ margin: 0 }}>
              {weekStart.format('DD MMM')} - {weekEnd.format('DD MMM YYYY')}
            </Title>
            <Button type="link" size="small" onClick={handleToday}>
              Ir a hoy
            </Button>
          </Space>
        </Col>
        <Col>
          <Button icon={<RightOutlined />} onClick={handleNextWeek}>
            Siguiente
          </Button>
        </Col>
      </Row>

      {!isLoading && totalAvailableSlots > 0 && (
        <Alert
          message={
            <Text>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              {totalAvailableSlots} horario{totalAvailableSlots !== 1 ? 's' : ''} disponible
              {totalAvailableSlots !== 1 ? 's' : ''} esta semana
            </Text>
          }
          type="success"
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Cargando disponibilidad..." />
        </div>
      ) : availability.length === 0 ? (
        <Alert
          message="Sin disponibilidad"
          description="No hay horarios disponibles para esta semana. Intente con otra semana."
          type="warning"
          showIcon
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {availability.map((day: any) => (
            <div
              key={day.date}
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 16,
                backgroundColor: '#fafafa',
              }}
            >
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                  <Space direction="vertical" size={0}>
                    <Title level={5} style={{ margin: 0, textTransform: 'capitalize' }}>
                      {day.day_name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {dayjs(day.date).format('DD/MM/YYYY')}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Space size="small">
                    <Tag color={day.available_count > 0 ? 'success' : 'default'}>
                      {day.available_count} / {day.total_count} disponibles
                    </Tag>
                  </Space>
                </Col>
              </Row>

              <Row gutter={[8, 8]}>
                {day.slots.map((slot: any, idx: any) => {
                  const isSelected =
                    selectedSlot?.date === day.date && selectedSlot?.startTime === slot.start_time

                  return (
                    <Col key={idx} xs={12} sm={8} md={6} lg={4}>
                      <Button
                        block
                        onClick={() => handleSlotClick(day, slot)}
                        disabled={!slot.is_available}
                        style={{
                          ...getSlotStyle(slot, isSelected),
                          height: 'auto',
                          padding: '8px 12px',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <Text
                            strong
                            style={{
                              fontSize: 14,
                              color: isSelected
                                ? 'white'
                                : slot.is_available
                                ? '#52c41a'
                                : '#bfbfbf',
                            }}
                          >
                            {slot.start_time}
                          </Text>
                          {slot.cubicle && slot.is_available && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: isSelected ? 'rgba(255,255,255,0.8)' : '#8c8c8c',
                              }}
                            >
                              <EnvironmentOutlined style={{ fontSize: 10 }} /> {slot.cubicle}
                            </Text>
                          )}
                        </Space>
                      </Button>
                    </Col>
                  )
                })}
              </Row>
            </div>
          ))}
        </Space>
      )}

      {selectedSlot && (
        <>
          <Divider />
          <Alert
            message="Horario Seleccionado"
            description={
              <Space direction="vertical" size={0}>
                <Text strong>
                  {dayjs(selectedSlot.date).format('dddd, DD [de] MMMM [de] YYYY')}
                </Text>
                <Text>
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </Text>
              </Space>
            }
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        </>
      )}
    </Modal>
  )
}
