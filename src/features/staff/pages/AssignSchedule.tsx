import {
  Card,
  Row,
  Col,
  Form,
  Steps,
  Space,
  Typography,
  Divider,
  Checkbox,
  Radio,
  Alert,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import {
  CustomDatePicker,
  CustomTimePicker,
} from '../../../components/form/CustomDatePicker'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import staffService from '../services/staff'
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'
import type { Staff, ScheduleTemplate, Cubicle } from '../models/staff'
import { DAYS_OPTIONS, STATUS_OPTIONS } from '../models/staff'
import { CustomInput } from '../../../components/input/CustomInput'

const { Title, Text } = Typography

type AssignmentType = 'recurring' | 'specific'

export const AssignSchedule = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [current, setCurrent] = useState(0)

  // States
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScheduleTemplate | null>(null)
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>('recurring')

  const [loadingStaff, setLoadingStaff] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [loadingCubicles, setLoadingCubicles] = useState(false)

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
      showNotification({ type: 'error', message: 'Error al cargar personal' })
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
      showNotification({ type: 'error', message: 'Error al cargar plantillas' })
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
      showNotification({ type: 'error', message: 'Error al cargar cubículos' })
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

    // Resetear selected_days cuando cambie el template
    form.setFieldValue('selected_days', undefined)
  }

  const handleAssignmentTypeChange = (type: AssignmentType) => {
    setAssignmentType(type)

    // Limpiar campos según el tipo
    if (type === 'recurring') {
      form.setFieldsValue({
        specific_date: undefined,
        specific_start_time: undefined,
        specific_end_time: undefined,
      })
    } else {
      form.setFieldsValue({
        start_date: undefined,
        end_date: undefined,
        selected_days: undefined,
      })
    }
  }

  const onFinish = (values: any) => {
    try {
      if (!values.staff_id || !values.schedule_template_id) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar personal y horario',
        })
        return
      }

      const assignmentData: any = {
        staff_id: values.staff_id,
        schedule_template_id: values.schedule_template_id,
        cubicle_id: values.cubicle_id || null,
        is_override: values.is_override || false,
        original_staff_id: values.original_staff_id || null,
        status: values.status || 'active',
        notes: values.notes,
      }

      // Asignación recurrente
      if (assignmentType === 'recurring') {
        assignmentData.start_date = values.start_date
          ? values.start_date.format('YYYY-MM-DD')
          : null
        assignmentData.end_date = values.end_date
          ? values.end_date.format('YYYY-MM-DD')
          : null
        assignmentData.selected_days =
          values.selected_days && values.selected_days.length > 0
            ? values.selected_days
            : null // null = todos los días
      }
      // Asignación específica
      else {
        if (
          !values.specific_date ||
          !values.specific_start_time ||
          !values.specific_end_time
        ) {
          showNotification({
            type: 'error',
            message: 'Debe especificar fecha, hora inicio y hora fin',
          })
          return
        }

        assignmentData.specific_date = values.specific_date.format('YYYY-MM-DD')
        assignmentData.specific_start_time =
          values.specific_start_time.format('HH:mm')
        assignmentData.specific_end_time =
          values.specific_end_time.format('HH:mm')
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
    { title: 'Personal', description: 'Seleccionar empleado' },
    { title: 'Horario', description: 'Elegir plantilla' },
    { title: 'Configurar', description: 'Detalles de asignación' },
  ]

  const next = () => {
    form
      .validateFields()
      .then(() => {
        const staffId = form.getFieldValue('staff_id')
        const templateId = form.getFieldValue('schedule_template_id')

        if (current === 0 && !staffId) {
          showNotification({
            type: 'warning',
            message: 'Debe seleccionar un personal',
          })
          return
        }
        if (current === 1 && !templateId) {
          showNotification({
            type: 'warning',
            message: 'Debe seleccionar un horario',
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

  const prev = () => setCurrent(current - 1)

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

            <CustomForm form={form} layout="vertical" onFinish={onFinish}>
              {/* ========== PASO 1: PERSONAL ========== */}
              {current === 0 && (
                <Card
                  type="inner"
                  title={
                    <Space>
                      <span>Paso 1: Seleccionar Personal</span>
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <CustomFormItem label="Personal" name="staff_id" required>
                    <CustomSelect
                      placeholder="Seleccionar personal..."
                      loading={loadingStaff}
                      showSearch
                      optionFilterProp="children"
                      onChange={handleStaffChange}
                      size="large"
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

                  {selectedStaff && (
                    <Card
                      size="small"
                      style={{ background: '#e6f7ff', marginTop: 16 }}
                    >
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
                  )}
                </Card>
              )}

              {/* ========== PASO 2: HORARIO ========== */}
              {current === 1 && (
                <Card
                  type="inner"
                  title={
                    <Space>
                      <span>Paso 2: Seleccionar Horario</span>
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <CustomFormItem name="staff_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>

                  <CustomFormItem
                    label="Plantilla de Horario"
                    name="schedule_template_id"
                    required
                  >
                    <CustomSelect
                      placeholder="Seleccionar plantilla..."
                      loading={loadingTemplates}
                      showSearch
                      optionFilterProp="children"
                      onChange={handleTemplateChange}
                      size="large"
                    >
                      {templatesList.map((template) => (
                        <Option key={template.id} value={template.id!}>
                          {template.name}
                        </Option>
                      ))}
                    </CustomSelect>
                  </CustomFormItem>

                  {selectedTemplate && (
                    <Card
                      size="small"
                      style={{ background: '#f6ffed', marginTop: 16 }}
                    >
                      <Title level={5} style={{ marginTop: 0 }}>
                        Horarios del Template:
                      </Title>
                      {selectedTemplate.schedule_days?.map((day, idx) => (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          <Text>
                            {day.day_of_week
                              ? DAYS_OPTIONS.find(
                                  (d) => d.value === day.day_of_week
                                )?.label
                              : 'Flexible'}
                            {' → '}
                            {day.start_time} - {day.end_time}
                          </Text>
                        </div>
                      ))}
                    </Card>
                  )}
                </Card>
              )}

              {/* ========== PASO 3: CONFIGURACIÓN ========== */}
              {current === 2 && (
                <>
                  <CustomFormItem name="staff_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>
                  <CustomFormItem name="schedule_template_id" hidden>
                    <CustomSelect />
                  </CustomFormItem>

                  <Card
                    type="inner"
                    title="Tipo de Asignación"
                    style={{ marginBottom: 16 }}
                  >
                    <Radio.Group
                      value={assignmentType}
                      onChange={(e) =>
                        handleAssignmentTypeChange(e.target.value)
                      }
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Card
                          size="small"
                          style={{
                            background:
                              assignmentType === 'recurring'
                                ? '#e6f7ff'
                                : '#fafafa',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            handleAssignmentTypeChange('recurring')
                          }
                        >
                          <Radio value="recurring">
                            <Space direction="vertical" size={0}>
                              <Text strong>Asignación Recurrente</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                El horario aplica de forma continua (ej: todos
                                los lunes, o del 1 al 31)
                              </Text>
                            </Space>
                          </Radio>
                        </Card>

                        <Card
                          size="small"
                          style={{
                            background:
                              assignmentType === 'specific'
                                ? '#fff7e6'
                                : '#fafafa',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleAssignmentTypeChange('specific')}
                        >
                          <Radio value="specific">
                            <Space direction="vertical" size={0}>
                              <Text strong>
                                Asignación Específica (Puntual)
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Solo para un día y horario concreto (ej: 15 de
                                enero, 9am-1pm)
                              </Text>
                            </Space>
                          </Radio>
                        </Card>
                      </Space>
                    </Radio.Group>
                  </Card>

                  {/* ========== ASIGNACIÓN RECURRENTE ========== */}
                  {assignmentType === 'recurring' && (
                    <Card
                      type="inner"
                      title="Configuración Recurrente"
                      style={{ marginBottom: 16 }}
                    >
                      <Alert
                        message="Horario Recurrente"
                        description="Este horario aplicará de forma continua en los días seleccionados dentro del período de vigencia."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Row gutter={16}>
                        <Col span={24}>
                          <CustomFormItem
                            label="Días Específicos (Opcional)"
                            name="selected_days"
                            extra="Si no seleccionas ninguno, aplicará TODOS los días de la plantilla"
                          >
                            <Checkbox.Group style={{ width: '100%' }}>
                              <Row gutter={[8, 8]}>
                                {DAYS_OPTIONS.map((day) => (
                                  <Col span={12} key={day.value}>
                                    <Checkbox value={day.value}>
                                      {day.label}
                                    </Checkbox>
                                  </Col>
                                ))}
                              </Row>
                            </Checkbox.Group>
                          </CustomFormItem>
                        </Col>

                        <Col xs={24} md={12}>
                          <CustomFormItem
                            label="Fecha de Inicio (Opcional)"
                            name="start_date"
                            extra="Desde cuándo aplica este horario"
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
                            label="Fecha de Fin (Opcional)"
                            name="end_date"
                            extra="Hasta cuándo aplica"
                          >
                            <CustomDatePicker
                              style={{ width: '100%' }}
                              placeholder="dd/mm/aaaa"
                              format="DD/MM/YYYY"
                            />
                          </CustomFormItem>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {/* ========== ASIGNACIÓN ESPECÍFICA ========== */}
                  {assignmentType === 'specific' && (
                    <Card
                      type="inner"
                      title="Configuración Específica"
                      style={{ marginBottom: 16 }}
                    >
                      <Alert
                        message="Asignación Puntual"
                        description="Esta asignación solo aplicará para la fecha y horario específicos que definas."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Row gutter={16}>
                        <Col span={24}>
                          <CustomFormItem
                            label="Fecha Específica"
                            name="specific_date"
                            required
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
                            label="Hora de Inicio"
                            name="specific_start_time"
                            required
                          >
                            <CustomTimePicker
                              style={{ width: '100%' }}
                              placeholder="HH:mm"
                              format="HH:mm"
                            />
                          </CustomFormItem>
                        </Col>

                        <Col xs={24} md={12}>
                          <CustomFormItem
                            label="Hora de Fin"
                            name="specific_end_time"
                            required
                          >
                            <CustomTimePicker
                              style={{ width: '100%' }}
                              placeholder="HH:mm"
                              format="HH:mm"
                            />
                          </CustomFormItem>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {/* ========== CONFIGURACIÓN ADICIONAL ========== */}
                  <Card
                    type="inner"
                    title="Configuración Adicional"
                    style={{ marginBottom: 16 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <CustomFormItem
                          label="Cubículo (Opcional)"
                          name="cubicle_id"
                        >
                          <CustomSelect
                            placeholder="Seleccionar cubículo..."
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

                      {/* <Col xs={24} md={12}>
                        <CustomFormItem label="Estado" name="status">
                          <CustomSelect placeholder="Estado de la asignación">
                            {STATUS_OPTIONS.map((opt) => (
                              <Option key={opt.value} value={opt.value}>
                                {opt.label}
                              </Option>
                            ))}
                          </CustomSelect>
                        </CustomFormItem>
                      </Col> */}

                      <Col span={24}>
                        <CustomFormItem label="Notas" name="notes">
                          <CustomInput.TextArea
                            rows={3}
                            placeholder="Observaciones..."
                          />
                        </CustomFormItem>
                      </Col>
                    </Row>
                  </Card>
                </>
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
