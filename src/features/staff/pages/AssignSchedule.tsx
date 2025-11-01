// src/features/staff/pages/AssignSchedule.tsx

import { Card, Row, Col, Form, Steps, Space, Typography, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomDatePicker } from '../../../components/form/CustomDatePicker'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import staffService from '../services/staff'
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'
import type {
  Staff,
  ScheduleTemplate,
  ScheduleDay,
  Cubicle,
} from '../models/staff'
import { DAY_OF_WEEK_MAP, STATUS_OPTIONS } from '../models/staff'
import { CustomInput } from '../../../components/input/CustomInput'

const { Title, Text } = Typography

export const AssignSchedule = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [current, setCurrent] = useState(0)

  // States
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScheduleTemplate | null>(null)
  const [selectedScheduleDay, setSelectedScheduleDay] =
    useState<ScheduleDay | null>(null)
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [loadingCubicles, setLoadingCubicles] = useState(false)

  // Data lists
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [templatesList, setTemplatesList] = useState<ScheduleTemplate[]>([])
  const [cubiclesList, setCubiclesList] = useState<Cubicle[]>([])

  useEffect(() => {
    loadStaff()
    loadTemplates()
    loadCubicles()
  }, [])

  const loadStaff = async () => {
    try {
      setLoadingStaff(true)
      const response = await staffService.getStaff({ active: true })
      const staffData = response?.data?.data || response?.data || []
      setStaffList(Array.isArray(staffData) ? staffData : [])
    } catch (error) {
      console.error('Error cargando personal:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar personal',
      })
      setStaffList([])
    } finally {
      setLoadingStaff(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await staffService.getScheduleTemplates()
      const templatesData = response?.data?.data || response?.data || []
      setTemplatesList(Array.isArray(templatesData) ? templatesData : [])
    } catch (error) {
      console.error('Error cargando plantillas:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar plantillas',
      })
      setTemplatesList([])
    } finally {
      setLoadingTemplates(false)
    }
  }

  const loadCubicles = async () => {
    try {
      setLoadingCubicles(true)
      const response = await staffService.getCubicles()
      const cubiclesData = response?.data?.data || response?.data || []
      setCubiclesList(Array.isArray(cubiclesData) ? cubiclesData : [])
    } catch (error) {
      console.error('Error cargando cubículos:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar cubículos',
      })
      setCubiclesList([])
    } finally {
      setLoadingCubicles(false)
    }
  }

  const { mutate: createAssignment, isPending } = useCustomMutation({
    execute: staffService.createStaffSchedule,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Horario asignado exitosamente',
      })
      form.resetFields()
      setSelectedStaff(null)
      setSelectedTemplate(null)
      setSelectedScheduleDay(null)
      setCurrent(0)
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleStaffChange = (staffId: number) => {
    const staff = staffList.find((s) => s.id === staffId)
    setSelectedStaff(staff || null)
    form.setFieldValue('staff_id', staffId)
  }

  const handleTemplateChange = (templateId: number) => {
    const template = templatesList.find((t) => t.id === templateId)
    setSelectedTemplate(template || null)
    form.setFieldValue('schedule_day_id', undefined)
    setSelectedScheduleDay(null)
  }

  const handleScheduleDayChange = (scheduleDayId: number) => {
    const scheduleDay = selectedTemplate?.schedule_days?.find(
      (d) => d.id === scheduleDayId
    )
    setSelectedScheduleDay(scheduleDay || null)
  }

  const onFinish = (values: any) => {
    try {
      if (!values.staff_id) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar un personal',
        })
        return
      }

      if (!values.schedule_day_id) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar un día de horario',
        })
        return
      }

      const assignmentData = {
        staff_id: values.staff_id,
        schedule_day_id: values.schedule_day_id,
        cubicle_id: values.cubicle_id || null,
        assignment_date: values.assignment_date
          ? values.assignment_date.format('YYYY-MM-DD')
          : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
        is_override: values.is_override || false,
        original_staff_id: values.original_staff_id || null,
        status: values.status || 'active',
        notes: values.notes,
      }

      createAssignment(assignmentData)
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error procesando los datos del formulario',
      })
    }
  }

  const steps = [
    {
      title: 'Seleccionar Personal',
      description: 'Elige el personal a asignar',
    },
    {
      title: 'Seleccionar Horario',
      description: 'Elige plantilla y día específico',
    },
    {
      title: 'Configuración',
      description: 'Detalles de la asignación',
    },
  ]

  const next = () => {
    form
      .validateFields()
      .then(() => {
        const staffId = form.getFieldValue('staff_id')
        const scheduleDayId = form.getFieldValue('schedule_day_id')
        if (current === 0 && !staffId) {
          showNotification({
            type: 'warning',
            message: 'Debe seleccionar un personal',
          })
          return
        }
        if (current === 1 && !scheduleDayId) {
          showNotification({
            type: 'warning',
            message: 'Debe seleccionar un día de horario',
          })
          return
        }
        setCurrent(current + 1)
      })
      .catch(() => {
        showNotification({
          type: 'warning',
          message: 'Complete los campos requeridos',
        })
      })
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24}>
          <Card
            title="Asignar Horario al Personal"
            extra={
              <CustomButton
                type="default"
                onClick={() => navigate('/consult-staff')}
                icon={<ArrowLeftOutlined />}
              >
                Volver
              </CustomButton>
            }
          >
            <Steps
              current={current}
              items={steps}
              style={{ marginBottom: 24 }}
            />

            <CustomForm
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ width: '100%' }}
            >
              {/* PASO 1: Seleccionar Personal */}
              {current === 0 && (
                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '24px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Title level={5} style={{ margin: '0 0 16px 0' }}>
                    Paso 1: Seleccionar Personal
                  </Title>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <CustomFormItem label="Personal" name="staff_id" required>
                        <CustomSelect
                          placeholder="Seleccionar personal..."
                          loading={loadingStaff}
                          showSearch
                          optionFilterProp="children"
                          onChange={handleStaffChange}
                          notFoundContent={
                            loadingStaff
                              ? 'Cargando...'
                              : 'No hay personal disponible'
                          }
                        >
                          {staffList.map((staff) => (
                            <Option key={staff.id} value={staff.id!}>
                              {`${staff.firstname} ${staff.lastname} - ${
                                staff.position?.name || 'Sin posición'
                              }`}
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
                    </Col>

                    {selectedStaff && (
                      <Col span={24}>
                        <Card size="small" style={{ background: '#e6f7ff' }}>
                          <Space direction="vertical" size={4}>
                            <Text strong>
                              {selectedStaff.firstname} {selectedStaff.lastname}
                            </Text>
                            <Text type="secondary">
                              Posición: {selectedStaff.position?.name}
                            </Text>
                            {selectedStaff.email && (
                              <Text type="secondary">
                                Email: {selectedStaff.email}
                              </Text>
                            )}
                          </Space>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* PASO 2: Seleccionar Horario */}
              {current === 1 && (
                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '24px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Title level={5} style={{ margin: '0 0 16px 0' }}>
                    Paso 2: Seleccionar Horario
                  </Title>

                  <CustomFormItem name="staff_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <CustomFormItem
                        label="Plantilla de Horario"
                        name="template_id"
                        required
                      >
                        <CustomSelect
                          placeholder="Seleccionar plantilla..."
                          loading={loadingTemplates}
                          showSearch
                          optionFilterProp="children"
                          onChange={handleTemplateChange}
                          notFoundContent={
                            loadingTemplates
                              ? 'Cargando...'
                              : 'No hay plantillas disponibles'
                          }
                        >
                          {templatesList.map((template) => (
                            <Option key={template.id} value={template.id!}>
                              {template.name}
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} md={12}>
                      <CustomFormItem
                        label="Día Específico"
                        name="schedule_day_id"
                        required
                      >
                        <CustomSelect
                          placeholder="Seleccionar día..."
                          disabled={!selectedTemplate}
                          onChange={handleScheduleDayChange}
                        >
                          {selectedTemplate?.schedule_days?.map((day) => (
                            <Option key={day.id} value={day.id!}>
                              {day.day_of_week
                                ? DAY_OF_WEEK_MAP[day.day_of_week]
                                : 'Flexible'}{' '}
                              ({day.start_time} - {day.end_time})
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
                    </Col>

                    {selectedScheduleDay && (
                      <Col span={24}>
                        <Card size="small" style={{ background: '#f6ffed' }}>
                          <Space direction="vertical" size={4}>
                            <Text strong>Horario Seleccionado:</Text>
                            <Text>
                              Día:{' '}
                              {selectedScheduleDay.day_of_week
                                ? DAY_OF_WEEK_MAP[
                                    selectedScheduleDay.day_of_week
                                  ]
                                : 'Flexible'}
                            </Text>
                            <Text>
                              Hora: {selectedScheduleDay.start_time} -{' '}
                              {selectedScheduleDay.end_time}
                            </Text>
                            <Text>
                              Recurrente:{' '}
                              {selectedScheduleDay.is_recurring ? 'Sí' : 'No'}
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* PASO 3: Configuración */}
              {current === 2 && (
                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '24px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Title level={5} style={{ margin: '0 0 16px 0' }}>
                    Paso 3: Configuración de la Asignación
                  </Title>

                  <CustomFormItem name="staff_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>
                  <CustomFormItem name="template_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>
                  <CustomFormItem name="schedule_day_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <CustomFormItem label="Cubículo" name="cubicle_id">
                        <CustomSelect
                          placeholder="Seleccionar cubículo (opcional)..."
                          loading={loadingCubicles}
                          allowClear
                        >
                          {cubiclesList.map((cubicle) => (
                            <Option key={cubicle.id} value={cubicle.id!}>
                              {cubicle.name} ({cubicle.code})
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} md={12}>
                      <CustomFormItem label="Estado" name="status">
                        <CustomSelect placeholder="Estado de la asignación">
                          {STATUS_OPTIONS.map((opt) => (
                            <Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Option>
                          ))}
                        </CustomSelect>
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} md={12}>
                      <CustomFormItem
                        label="Fecha de Inicio (opcional)"
                        name="assignment_date"
                      >
                        <CustomDatePicker
                          style={{ width: '100%' }}
                          placeholder="dd/mm/aaaa"
                          format="DD/MM/YYYY"
                        />
                      </CustomFormItem>
                    </Col>

                    <Col xs={24} md={12}>
                      <CustomFormItem
                        label="Fecha de Fin (opcional)"
                        name="end_date"
                      >
                        <CustomDatePicker
                          style={{ width: '100%' }}
                          placeholder="dd/mm/aaaa"
                          format="DD/MM/YYYY"
                        />
                      </CustomFormItem>
                    </Col>

                    <Col span={24}>
                      <CustomFormItem label="Notas" name="notes">
                        <CustomInput.TextArea
                          rows={3}
                          placeholder="Notas adicionales sobre la asignación..."
                        />
                      </CustomFormItem>
                    </Col>
                  </Row>
                </div>
              )}

              <Divider />

              <Row justify="space-between" style={{ marginTop: 16 }}>
                <Col>
                  {current > 0 && (
                    <CustomButton onClick={prev}>Anterior</CustomButton>
                  )}
                </Col>
                <Col>
                  <Space>
                    <CustomButton onClick={() => navigate('/consult-staff')}>
                      Cancelar
                    </CustomButton>
                    {current < steps.length - 1 && (
                      <CustomButton type="primary" onClick={next}>
                        Siguiente
                      </CustomButton>
                    )}
                    {current === steps.length - 1 && (
                      <CustomButton
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        icon={<CheckCircleOutlined />}
                      >
                        Asignar Horario
                      </CustomButton>
                    )}
                  </Space>
                </Col>
              </Row>
            </CustomForm>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
