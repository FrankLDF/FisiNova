// src/features/consultation/pages/ConsultationForm.tsx
import {
  Card,
  Steps,
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  Checkbox,
  Select,
  Space,
  Alert,
} from 'antd'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import consultationService from '../services/consultation'
import appointmentService from '../../appointment/services/appointment'
import { showHandleError } from '../../../utils/handleError'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { MedicalRecord } from '../models/medicalRecords'
import dayjs from 'dayjs'

const { TextArea } = Input

export const ConsultationForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [current, setCurrent] = useState(0)
  const [isViewMode, setIsViewMode] = useState(false)

  const [diagnostics, setDiagnostics] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])

  useEffect(() => {
    const path = window.location.pathname
    setIsViewMode(path.includes('/view'))
  }, [])

  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointment(Number(id)),
    enabled: !!id,
  })

  const { data: medicalRecordData } = useQuery({
    queryKey: ['medical-record', id],
    queryFn: () => consultationService.getMedicalRecord(Number(id)),
    enabled: !!id,
  })

  const { data: patientHistoryData } = useQuery({
    queryKey: ['patient-history', appointmentData?.data?.patient_id],
    queryFn: () =>
      consultationService.getPatientHistory(appointmentData?.data?.patient_id),
    enabled: !!appointmentData?.data?.patient_id,
  })

  const { mutate: saveMedicalRecord, isPending } = useCustomMutation({
    execute: (data: MedicalRecord) => {
      if (medicalRecordData?.data?.id) {
        return consultationService.updateMedicalRecord(
          medicalRecordData.data.id,
          data
        )
      }
      return consultationService.createMedicalRecord(data)
    },
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Consulta guardada exitosamente',
      })
    },
    onError: showHandleError,
  })

  const { mutate: completeConsultation, isPending: isCompleting } =
    useCustomMutation({
      execute: () => consultationService.completeConsultation(Number(id)),
      onSuccess: () => {
        showNotification({
          type: 'success',
          message: 'Consulta finalizada',
        })
        navigate('/medic-dashboard')
      },
      onError: showHandleError,
    })

  useEffect(() => {
    if (appointmentData?.data && !medicalRecordData?.data) {
      const appointment = appointmentData.data
      form.setFieldsValue({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        employee_id: appointment.employee_id,
      })

      if (appointment.status !== 'en_atencion') {
        consultationService.startConsultation(appointment.id)
      }
    }
  }, [appointmentData, form, medicalRecordData])

  useEffect(() => {
    if (medicalRecordData?.data) {
      const record = medicalRecordData.data
      form.setFieldsValue(record)
    }
  }, [medicalRecordData, form])

  const loadDiagnostics = async (search?: string) => {
    try {
      const res = await consultationService.getDiagnostics(search)
      setDiagnostics(res?.data?.data || res?.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const loadProcedures = async (search?: string) => {
    try {
      const res = await consultationService.getProcedureStandards(search)
      setProcedures(res?.data?.data || res?.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const bmi =
        values.weight && values.height
          ? (values.weight / (values.height / 100) ** 2).toFixed(2)
          : null

      saveMedicalRecord({
        ...values,
        bmi,
      })
    })
  }

  const handleComplete = () => {
    form.validateFields().then((values) => {
      const bmi =
        values.weight && values.height
          ? (values.weight / (values.height / 100) ** 2).toFixed(2)
          : null

      saveMedicalRecord({
        ...values,
        bmi,
      })

      setTimeout(() => {
        completeConsultation()
      }, 500)
    })
  }

  const steps = [
    { title: 'Motivo y Signos Vitales' },
    { title: 'Antecedentes' },
    { title: 'Examen Físico' },
    { title: 'Diagnóstico y Plan' },
  ]

  const appointment = appointmentData?.data
  const patientHistory =
    patientHistoryData?.data?.data || patientHistoryData?.data || []

  if (loadingAppointment) {
    return <Card loading />
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <Card
        title={isViewMode ? 'Ver Consulta' : 'Registro de Consulta Médica'}
        extra={
          <CustomButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/medic-dashboard')}
          >
            Volver
          </CustomButton>
        }
      >
        {/* Info del paciente */}
        <Card size="small" style={{ marginBottom: 16, background: '#f6ffed' }}>
          <Row gutter={16}>
            <Col span={12}>
              <strong>Paciente:</strong> {appointment?.patient?.firstname}{' '}
              {appointment?.patient?.lastname}
            </Col>
            <Col span={6}>
              <strong>DNI:</strong> {appointment?.patient?.dni || 'N/A'}
            </Col>
            <Col span={6}>
              <strong>Edad:</strong>{' '}
              {appointment?.patient?.birthdate
                ? `${dayjs().diff(appointment.patient.birthdate, 'years')} años`
                : 'N/A'}
            </Col>
          </Row>
        </Card>

        {/* Historial previo */}
        {patientHistory.length > 0 && (
          <Alert
            message={`Paciente con ${patientHistory.length} consulta(s) previa(s)`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Steps current={current} items={steps} style={{ marginBottom: 24 }} />

        <CustomForm form={form} layout="vertical">
          <CustomFormItem name="appointment_id" hidden>
            <Input />
          </CustomFormItem>
          <CustomFormItem name="patient_id" hidden>
            <Input />
          </CustomFormItem>
          <CustomFormItem name="employee_id" hidden>
            <Input />
          </CustomFormItem>

          {/* Step 0: Motivo y Signos Vitales */}
          {current === 0 && (
            <>
              <Card
                type="inner"
                title="Motivo de Consulta"
                style={{ marginBottom: 16 }}
              >
                <CustomFormItem
                  label="Motivo Principal"
                  name="chief_complaint"
                  required
                >
                  <TextArea
                    rows={2}
                    placeholder="¿Por qué consulta el paciente?"
                    readOnly={isViewMode}
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="Enfermedad Actual"
                  name="current_illness"
                >
                  <TextArea
                    rows={3}
                    placeholder="Descripción detallada..."
                    readOnly={isViewMode}
                  />
                </CustomFormItem>
              </Card>

              <Card type="inner" title="Signos Vitales">
                <Row gutter={16}>
                  <Col span={6}>
                    <CustomFormItem
                      label="Presión Sistólica"
                      name="blood_pressure_systolic"
                    >
                      <InputNumber
                        placeholder="120"
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                  <Col span={6}>
                    <CustomFormItem
                      label="Presión Diastólica"
                      name="blood_pressure_diastolic"
                    >
                      <InputNumber
                        placeholder="80"
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                  <Col span={6}>
                    <CustomFormItem
                      label="Frecuencia Cardíaca"
                      name="heart_rate"
                    >
                      <InputNumber
                        placeholder="70"
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                  <Col span={6}>
                    <CustomFormItem label="Temperatura (°C)" name="temperature">
                      <InputNumber
                        placeholder="36.5"
                        step={0.1}
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={6}>
                    <CustomFormItem label="Peso (kg)" name="weight">
                      <InputNumber
                        placeholder="70"
                        step={0.1}
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                  <Col span={6}>
                    <CustomFormItem label="Altura (cm)" name="height">
                      <InputNumber
                        placeholder="170"
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                  <Col span={6}>
                    <CustomFormItem
                      label="Saturación O2 (%)"
                      name="oxygen_saturation"
                    >
                      <InputNumber
                        placeholder="98"
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                  <Col span={6}>
                    <CustomFormItem
                      label="Frec. Respiratoria"
                      name="respiratory_rate"
                    >
                      <InputNumber
                        placeholder="16"
                        style={{ width: '100%' }}
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </Card>
            </>
          )}

          {/* Step 1: Antecedentes */}
          {current === 1 && (
            <>
              <Card type="inner" title="Hábitos" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <CustomFormItem name="smokes" valuePropName="checked">
                      <Checkbox disabled={isViewMode}>Fuma</Checkbox>
                    </CustomFormItem>
                    <CustomFormItem name="smoking_frequency">
                      <Input placeholder="Frecuencia" readOnly={isViewMode} />
                    </CustomFormItem>
                  </Col>
                  <Col span={8}>
                    <CustomFormItem
                      name="drinks_alcohol"
                      valuePropName="checked"
                    >
                      <Checkbox disabled={isViewMode}>Consume Alcohol</Checkbox>
                    </CustomFormItem>
                    <CustomFormItem name="alcohol_frequency">
                      <Input placeholder="Frecuencia" readOnly={isViewMode} />
                    </CustomFormItem>
                  </Col>
                  <Col span={8}>
                    <CustomFormItem name="uses_drugs" valuePropName="checked">
                      <Checkbox disabled={isViewMode}>Usa Drogas</Checkbox>
                    </CustomFormItem>
                    <CustomFormItem name="drug_type">
                      <Input placeholder="Tipo" readOnly={isViewMode} />
                    </CustomFormItem>
                  </Col>
                </Row>
              </Card>

              <Card
                type="inner"
                title="Enfermedades Crónicas"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <CustomFormItem name="has_diabetes" valuePropName="checked">
                      <Checkbox disabled={isViewMode}>Diabetes</Checkbox>
                    </CustomFormItem>
                  </Col>
                  <Col span={8}>
                    <CustomFormItem
                      name="has_hypertension"
                      valuePropName="checked"
                    >
                      <Checkbox disabled={isViewMode}>Hipertensión</Checkbox>
                    </CustomFormItem>
                  </Col>
                  <Col span={8}>
                    <CustomFormItem name="has_asthma" valuePropName="checked">
                      <Checkbox disabled={isViewMode}>Asma</Checkbox>
                    </CustomFormItem>
                  </Col>
                </Row>
                <CustomFormItem
                  label="Otras Condiciones"
                  name="other_conditions"
                >
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
              </Card>

              <Card
                type="inner"
                title="Antecedentes Médicos"
                style={{ marginBottom: 16 }}
              >
                <CustomFormItem
                  label="Cirugías Previas"
                  name="previous_surgeries"
                >
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
                <CustomFormItem
                  label="Medicamentos Actuales"
                  name="current_medications"
                >
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
                <CustomFormItem label="Alergias" name="allergies">
                  <TextArea
                    rows={2}
                    placeholder="Alergias a medicamentos, alimentos, etc."
                    readOnly={isViewMode}
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="Antecedentes Familiares"
                  name="family_history"
                >
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
              </Card>
            </>
          )}

          {/* Step 2: Examen Físico */}
          {current === 2 && (
            <Card type="inner" title="Examen Físico">
              <CustomFormItem
                label="Hallazgos del Examen Físico"
                name="physical_exam"
              >
                <TextArea
                  rows={8}
                  placeholder="Descripción detallada del examen físico..."
                  readOnly={isViewMode}
                />
              </CustomFormItem>
            </Card>
          )}

          {/* Step 3: Diagnóstico y Plan */}
          {current === 3 && (
            <>
              <Card
                type="inner"
                title="Diagnóstico"
                style={{ marginBottom: 16 }}
              >
                <CustomFormItem
                  label="Diagnósticos (CIE10)"
                  name="diagnosis_ids"
                  required
                >
                  <Select
                    mode="multiple"
                    placeholder="Buscar diagnósticos..."
                    showSearch
                    filterOption={false}
                    onSearch={loadDiagnostics}
                    onFocus={() => loadDiagnostics()}
                    disabled={isViewMode}
                    options={diagnostics.map((d: any) => ({
                      label: `${d.code} - ${d.description}`,
                      value: d.id,
                    }))}
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="Notas del Diagnóstico"
                  name="diagnosis_notes"
                >
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
              </Card>

              <Card
                type="inner"
                title="Procedimientos"
                style={{ marginBottom: 16 }}
              >
                <CustomFormItem
                  label="Procedimientos"
                  name="procedure_ids"
                  required
                >
                  <Select
                    mode="multiple"
                    placeholder="Buscar procedimientos..."
                    showSearch
                    filterOption={false}
                    onSearch={loadProcedures}
                    onFocus={() => loadProcedures()}
                    disabled={isViewMode}
                    options={procedures.map((p: any) => ({
                      label: `${p.standard || ''} - ${p.description}`,
                      value: p.id,
                    }))}
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="Notas de Procedimientos"
                  name="procedure_notes"
                >
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
              </Card>

              <Card type="inner" title="Plan de Tratamiento">
                <CustomFormItem
                  label="Plan de Tratamiento"
                  name="treatment_plan"
                >
                  <TextArea
                    rows={3}
                    placeholder="Indicaciones y tratamiento..."
                    readOnly={isViewMode}
                  />
                </CustomFormItem>
                <CustomFormItem label="Prescripciones" name="prescriptions">
                  <TextArea
                    rows={3}
                    placeholder="Medicamentos prescritos..."
                    readOnly={isViewMode}
                  />
                </CustomFormItem>
                <CustomFormItem label="Recomendaciones" name="recommendations">
                  <TextArea
                    rows={2}
                    placeholder="Recomendaciones al paciente..."
                    readOnly={isViewMode}
                  />
                </CustomFormItem>
                <CustomFormItem label="Notas Generales" name="general_notes">
                  <TextArea rows={2} readOnly={isViewMode} />
                </CustomFormItem>
              </Card>
            </>
          )}

          {/* Botones de navegación */}
          <Row justify="space-between" style={{ marginTop: 24 }}>
            <Col>
              {current > 0 && !isViewMode && (
                <CustomButton onClick={() => setCurrent(current - 1)}>
                  Anterior
                </CustomButton>
              )}
            </Col>
            <Col>
              <Space>
                {!isViewMode && (
                  <CustomButton
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={isPending}
                  >
                    Guardar
                  </CustomButton>
                )}
                {current < steps.length - 1 ? (
                  <CustomButton
                    type="primary"
                    onClick={() => setCurrent(current + 1)}
                  >
                    Siguiente
                  </CustomButton>
                ) : (
                  !isViewMode && (
                    <CustomButton
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleComplete}
                      loading={isCompleting}
                    >
                      Finalizar Consulta
                    </CustomButton>
                  )
                )}
              </Space>
            </Col>
          </Row>
        </CustomForm>
      </Card>
    </div>
  )
}
