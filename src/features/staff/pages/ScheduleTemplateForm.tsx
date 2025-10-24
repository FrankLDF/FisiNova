// src/features/staff/pages/ScheduleTemplateForm.tsx

import { Card, Row, Col, Form, Button, Space, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomTimePicker } from '../../../components/form/CustomDatePicker'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import staffService from '../services/staff'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'
import { DAYS_OPTIONS } from '../models/staff'
import dayjs, { Dayjs } from 'dayjs'

const { Title } = Typography

interface ScheduleDayForm {
  day_of_week?: number
  start_time: Dayjs
  end_time: Dayjs
  is_recurring?: boolean
}

export const ScheduleTemplateForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [scheduleDays, setScheduleDays] = useState<ScheduleDayForm[]>([
    {
      start_time: dayjs('08:00', 'HH:mm'),
      end_time: dayjs('17:00', 'HH:mm'),
      is_recurring: true,
    },
  ])

  const { data: templateData } = useQuery({
    queryKey: ['schedule-template', id],
    queryFn: () => staffService.getScheduleTemplateById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (templateData?.data && id) {
      const template = templateData.data

      form.setFieldsValue({
        name: template.name,
        description: template.description,
      })

      if (template.schedule_days && template.schedule_days.length > 0) {
        const days = template.schedule_days.map((day: any) => ({
          day_of_week: day.day_of_week,
          start_time: dayjs(day.start_time, 'HH:mm'),
          end_time: dayjs(day.end_time, 'HH:mm'),
          is_recurring: day.is_recurring ?? true,
        }))
        setScheduleDays(days)
      }
    }
  }, [templateData, form, id])

  const { mutate: createTemplate, isPending: isCreating } = useCustomMutation({
    execute: staffService.createScheduleTemplate,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Plantilla de horario creada exitosamente',
      })
      navigate('/consult-schedules')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: updateTemplate, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      staffService.updateScheduleTemplate(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Plantilla actualizada exitosamente',
      })
      navigate('/consult-schedules')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const addScheduleDay = () => {
    setScheduleDays([
      ...scheduleDays,
      {
        start_time: dayjs('08:00', 'HH:mm'),
        end_time: dayjs('17:00', 'HH:mm'),
        is_recurring: true,
      },
    ])
  }

  const removeScheduleDay = (index: number) => {
    if (scheduleDays.length > 1) {
      setScheduleDays(scheduleDays.filter((_, i) => i !== index))
    } else {
      showNotification({
        type: 'warning',
        message: 'Debe haber al menos un día en la plantilla',
      })
    }
  }

  const updateScheduleDay = (
    index: number,
    field: keyof ScheduleDayForm,
    value: any
  ) => {
    const newDays = [...scheduleDays]
    newDays[index] = { ...newDays[index], [field]: value }
    setScheduleDays(newDays)
  }

  const onFinish = (values: any) => {
    try {
      if (!values.name) {
        showNotification({
          type: 'error',
          message: 'El nombre de la plantilla es requerido',
        })
        return
      }

      if (scheduleDays.length === 0) {
        showNotification({
          type: 'error',
          message: 'Debe agregar al menos un día de horario',
        })
        return
      }

      for (let i = 0; i < scheduleDays.length; i++) {
        const day = scheduleDays[i]
        if (!day.start_time || !day.end_time) {
          showNotification({
            type: 'error',
            message: `Día ${i + 1}: Las horas de inicio y fin son requeridas`,
          })
          return
        }
      }

      const templateData = {
        name: values.name,
        description: values.description,
        schedule_days: scheduleDays.map((day) => ({
          day_of_week: day.day_of_week || null,
          start_time: day.start_time.format('HH:mm'),
          end_time: day.end_time.format('HH:mm'),
          is_recurring: day.is_recurring ?? true,
        })),
      }

      if (id) {
        updateTemplate({ id: Number(id), data: templateData })
      } else {
        createTemplate(templateData)
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error procesando los datos del formulario',
      })
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24}>
          <Card
            title={
              id ? 'Editar Plantilla de Horario' : 'Crear Plantilla de Horario'
            }
            extra={
              <CustomButton
                type="default"
                onClick={() => navigate('/consult-schedules')}
                icon={<ArrowLeftOutlined />}
              >
                Volver
              </CustomButton>
            }
          >
            <CustomForm
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ width: '100%' }}
            >
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '24px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Title level={5} style={{ margin: '0 0 16px 0' }}>
                  Información de la Plantilla
                </Title>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <CustomFormItem
                      label="Nombre de la Plantilla"
                      name="name"
                      required
                    >
                      <CustomInput placeholder="Ej: Turno Completo, Medio Turno..." />
                    </CustomFormItem>
                  </Col>

                  <Col span={24}>
                    <CustomFormItem label="Descripción" name="description">
                      <CustomInput.TextArea
                        rows={3}
                        placeholder="Descripción de la plantilla de horario..."
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </div>

              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '24px',
                  border: '1px solid #e9ecef',
                }}
              >
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 16 }}
                >
                  <Col>
                    <Title level={5} style={{ margin: 0 }}>
                      Días y Horarios
                    </Title>
                  </Col>
                  <Col>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addScheduleDay}
                    >
                      Agregar Día
                    </Button>
                  </Col>
                </Row>

                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="middle"
                >
                  {scheduleDays.map((day, index) => (
                    <Card
                      key={index}
                      size="small"
                      title={`Día ${index + 1}`}
                      extra={
                        scheduleDays.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeScheduleDay(index)}
                          >
                            Eliminar
                          </Button>
                        )
                      }
                    >
                      <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12} md={8}>
                          <label>Día de la Semana:</label>
                          <CustomSelect
                            placeholder="Seleccionar día (opcional)"
                            value={day.day_of_week}
                            onChange={(value) =>
                              updateScheduleDay(index, 'day_of_week', value)
                            }
                            allowClear
                          >
                            {DAYS_OPTIONS.map((opt) => (
                              <Option key={opt.value} value={opt.value}>
                                {opt.label}
                              </Option>
                            ))}
                          </CustomSelect>
                        </Col>

                        <Col xs={12} sm={6} md={4}>
                          <label>Hora Inicio:</label>
                          <CustomTimePicker
                            style={{ width: '100%' }}
                            format="HH:mm"
                            value={day.start_time}
                            onChange={(time) =>
                              updateScheduleDay(index, 'start_time', time)
                            }
                          />
                        </Col>

                        <Col xs={12} sm={6} md={4}>
                          <label>Hora Fin:</label>
                          <CustomTimePicker
                            style={{ width: '100%' }}
                            format="HH:mm"
                            value={day.end_time}
                            onChange={(time) =>
                              updateScheduleDay(index, 'end_time', time)
                            }
                          />
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                          <label>¿Recurrente?</label>
                          <CustomSelect
                            value={day.is_recurring ?? true}
                            onChange={(value) =>
                              updateScheduleDay(index, 'is_recurring', value)
                            }
                          >
                            <Option value={true}>Sí (Semanal)</Option>
                            <Option value={false}>No</Option>
                          </CustomSelect>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              </div>

              <Row justify="end" gutter={16} style={{ marginTop: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                  <CustomButton
                    type="default"
                    onClick={() => navigate('/consult-schedules')}
                    style={{ width: '100%', minHeight: '40px' }}
                  >
                    Cancelar
                  </CustomButton>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <CustomButton
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    icon={<SaveOutlined />}
                    style={{ width: '100%', minHeight: '40px' }}
                  >
                    {id ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                  </CustomButton>
                </Col>
              </Row>
            </CustomForm>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
