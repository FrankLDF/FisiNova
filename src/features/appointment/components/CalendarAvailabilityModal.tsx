import {
  Modal,
  Calendar,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Card,
  Empty,
  Spin,
  Alert,
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import { useAppointmentAvailability } from '../hooks/useAppointmentAvailability'
import type { DayAvailability, TimeSlot } from '../services/appointment'

const { Title, Text } = Typography

interface CalendarAvailabilityModalProps {
  open: boolean
  onClose: () => void
  doctorId?: number
  doctorName?: string
  onTimeSelected: (date: string, startTime: string, endTime: string) => void
  initialDate?: string
  duration?: number
}

export const CalendarAvailabilityModal: React.FC<CalendarAvailabilityModalProps> = ({
  open,
  onClose,
  doctorId,
  doctorName,
  onTimeSelected,
  initialDate,
  duration = 60,
}) => {
  // Asegurar que initialDate no sea en el pasado
  const getInitialDate = () => {
    const initial = initialDate ? dayjs(initialDate) : dayjs()
    return initial.isBefore(dayjs(), 'day') ? dayjs() : initial
  }

  const [selectedDate, setSelectedDate] = useState<Dayjs>(getInitialDate())
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(getInitialDate())

  // Calcular rango del mes actual
  const startOfMonth = currentMonth.startOf('month')
  const endOfMonth = currentMonth.endOf('month')

  // Hook de disponibilidad
  const { availability, isLoading } = useAppointmentAvailability(
    doctorId || null,
    startOfMonth.format('YYYY-MM-DD'),
    endOfMonth.format('YYYY-MM-DD'),
    duration
  )

  useEffect(() => {
    if (open && initialDate) {
      const initial = dayjs(initialDate)
      const validDate = initial.isBefore(dayjs(), 'day') ? dayjs() : initial
      setSelectedDate(validDate)
      setCurrentMonth(validDate)
    }
  }, [open, initialDate])

  // Encontrar disponibilidad para una fecha específica
  const getDayAvailability = (date: Dayjs): DayAvailability | undefined => {
    return availability.find((day) => day.date === date.format('YYYY-MM-DD'))
  }

  // Renderizar header del calendario con navegación
  const headerRender = ({ value, onChange }: any) => {
    const month = value.month()
    const year = value.year()

    return (
      <div style={{ padding: '8px 16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {value.locale('es').format('MMMM YYYY')}
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<LeftOutlined />}
                onClick={() => {
                  const newValue = value.clone().month(month - 1)
                  onChange(newValue)
                  setCurrentMonth(newValue)
                }}
              />
              <Button
                onClick={() => {
                  const today = dayjs()
                  onChange(today)
                  setCurrentMonth(today)
                  setSelectedDate(today)
                }}
              >
                Hoy
              </Button>
              <Button
                icon={<RightOutlined />}
                onClick={() => {
                  const newValue = value.clone().month(month + 1)
                  onChange(newValue)
                  setCurrentMonth(newValue)
                }}
              />
            </Space>
          </Col>
        </Row>
      </div>
    )
  }

  // Manejar selección de fecha
  const handleDateSelect = (date: Dayjs) => {
    // No permitir seleccionar fechas pasadas
    if (date.isBefore(dayjs(), 'day')) {
      return
    }
    setSelectedDate(date)
    // Actualizar el mes actual si la fecha seleccionada está en otro mes
    if (!date.isSame(currentMonth, 'month')) {
      setCurrentMonth(date)
    }
  }

  // Verificar si una fecha está deshabilitada
  const isDateDisabled = (date: Dayjs): boolean => {
    // Deshabilitar fechas pasadas
    if (date.isBefore(dayjs(), 'day')) {
      return true
    }

    // Deshabilitar días sin disponibilidad
    const dayAvailability = getDayAvailability(date)
    return !dayAvailability || dayAvailability.available_count === 0
  }

  // Manejar selección de horario
  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (slot.is_available) {
      onTimeSelected(selectedDate.format('YYYY-MM-DD'), slot.start_time, slot.end_time)
    }
  }

  const selectedDayAvailability = getDayAvailability(selectedDate)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <ClockCircleOutlined />
          <span>Calendario de Disponibilidad {doctorName && `- ${doctorName}`}</span>
        </Space>
      }
      width={900}
      footer={null}
      destroyOnClose
    >
      <style>
        {`
          /* Hover en días disponibles */
          .calendar-available:hover {
            background-color: #e6f7ff !important;
          }
          
          /* Asegurar que las celdas tengan altura completa */
          .ant-picker-calendar .ant-picker-cell {
            padding: 2px !important;
          }
          
          .ant-picker-calendar .ant-picker-cell-inner {
            width: 100%;
            height: 100%;
            min-height: 32px;
          }
        `}
      </style>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Aviso sobre fechas pasadas */}
        <Alert
          message="Las fechas y horarios anteriores al momento actual no están disponibles para selección"
          type="warning"
          showIcon
          closable
        />

        {/* Calendario */}
        <Spin spinning={isLoading}>
          <Calendar
            value={currentMonth}
            fullscreen={false}
            fullCellRender={(date) => {
              const dayAvailability = getDayAvailability(date)
              const isSelected = selectedDate.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
              const isPast = date.isBefore(dayjs(), 'day')
              const isDisabled = isPast || !dayAvailability || dayAvailability.available_count === 0

              return (
                <div
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  style={{
                    backgroundColor: isSelected
                      ? '#1890ff'
                      : isDisabled
                      ? '#f5f5f5'
                      : 'transparent',
                    color: isSelected ? 'white' : isDisabled ? '#d9d9d9' : 'inherit',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    padding: '8px 0',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = '#e6f7ff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {date.date()}
                </div>
              )
            }}
            headerRender={headerRender}
            onPanelChange={(date) => {
              setCurrentMonth(date)
            }}
          />
        </Spin>

        {/* Horarios disponibles del día seleccionado */}
        <Card
          title={
            <Space>
              <CheckCircleOutlined />
              <span>
                Horarios disponibles - {selectedDate.locale('es').format('dddd, D [de] MMMM')}
              </span>
            </Space>
          }
          size="small"
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : selectedDayAvailability && selectedDayAvailability.slots.length > 0 ? (
            <>
              {selectedDate.isSame(dayjs(), 'day') && (
                <Alert
                  message="Solo se muestran horarios futuros"
                  description="Los horarios anteriores a la hora actual no están disponibles"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  closable
                />
              )}
              <Row gutter={[8, 8]}>
                {selectedDayAvailability.slots.filter((slot) => {
                  // Solo mostrar slots disponibles
                  if (!slot.is_available) return false

                  // Si es hoy, filtrar horarios pasados
                  const isToday = selectedDate.isSame(dayjs(), 'day')
                  if (isToday) {
                    const now = dayjs()
                    const slotTime = dayjs(
                      `${selectedDate.format('YYYY-MM-DD')} ${slot.start_time}`
                    )
                    return slotTime.isAfter(now)
                  }

                  return true
                }).length > 0 ? (
                  selectedDayAvailability.slots
                    .filter((slot) => {
                      if (!slot.is_available) return false
                      const isToday = selectedDate.isSame(dayjs(), 'day')
                      if (isToday) {
                        const now = dayjs()
                        const slotTime = dayjs(
                          `${selectedDate.format('YYYY-MM-DD')} ${slot.start_time}`
                        )
                        return slotTime.isAfter(now)
                      }
                      return true
                    })
                    .map((slot, index) => (
                      <Col xs={12} sm={8} md={6} key={index}>
                        <Button
                          type="primary"
                          block
                          onClick={() => handleTimeSlotClick(slot)}
                          style={{
                            backgroundColor: '#52c41a',
                            borderColor: '#52c41a',
                            height: 'auto',
                            padding: '8px',
                          }}
                        >
                          <Space direction="vertical" size={0}>
                            <Text style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
                              {slot.start_time}
                            </Text>
                            {slot.cubicle && (
                              <Text style={{ color: 'white', fontSize: '11px', opacity: 0.9 }}>
                                {slot.cubicle}
                              </Text>
                            )}
                          </Space>
                        </Button>
                      </Col>
                    ))
                ) : (
                  <Col span={24}>
                    <Empty
                      description="No hay horarios disponibles para el resto del día de hoy. Por favor seleccione otro día."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </Col>
                )}
              </Row>
            </>
          ) : (
            <Empty
              description="No hay horarios disponibles para esta fecha"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>

        {/* Leyenda */}
        <Card size="small" title="Leyenda">
          <Space direction="vertical">
            <Space>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#1890ff',
                  borderRadius: 4,
                }}
              />
              <Text>Día seleccionado</Text>
            </Space>
            <Space>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'white',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                }}
              />
              <Text>Días con horarios disponibles (click para ver)</Text>
            </Space>
            <Space>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                }}
              />
              <Text>Sin horarios disponibles</Text>
            </Space>
          </Space>
        </Card>
      </Space>
    </Modal>
  )
}
