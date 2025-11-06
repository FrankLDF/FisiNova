// src/features/patient/pages/PatientForm.tsx

import {
  Card,
  Row,
  Col,
  Form,
  Grid,
  Skeleton,
  Space,
  Alert,
  Divider,
  DatePicker,
  Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import patientService from '../services/patient'
import insuranceService from '../../insurances/services/insurance'
import dayjs from 'dayjs'
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'

const { Text } = Typography

type FormMode = 'create' | 'edit' | 'view'

export const PatientForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const isSmallDevice = Grid.useBreakpoint()?.xs || false

  const [mode, setMode] = useState<FormMode>('create')
  const [isEditing, setIsEditing] = useState(false)
  const [insurances, setInsurances] = useState<any[]>([])
  const [loadingInsurances, setLoadingInsurances] = useState(false)

  useEffect(() => {
    const currentPath = window.location.pathname

    if (id) {
      if (currentPath.includes('/edit')) {
        setMode('edit')
        setIsEditing(true)
      } else {
        setMode('view')
        setIsEditing(false)
      }
    } else {
      setMode('create')
      setIsEditing(true)
    }
  }, [id])

  const { data: patientData, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getPatientById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    loadInsurances()
  }, [])

  useEffect(() => {
    if (patientData?.data && id) {
      const patient = patientData.data

      // Asegúrate que insurance_id sea un número o null
      form.setFieldsValue({
        firstname: patient.firstname,
        lastname: patient.lastname,
        dni: patient.dni,
        passport: patient.passport,
        sex: patient.sex,
        birthdate: patient.birthdate ? dayjs(patient.birthdate) : null,
        email: patient.email,
        phone: patient.phone,
        cellphone: patient.cellphone,
        address: patient.address,
        city: patient.city,
        insurance_code: patient.insurance_code,
        insurance_id: patient.insurance_id
          ? Number(patient.insurance_id)
          : null,
        active: patient.active ?? true,
      })
    }
  }, [patientData, form, id])

  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true)
      const response = await insuranceService.getInsurances({ active: true })
      const insurancesData = response?.data?.data || response?.data || []
      setInsurances(Array.isArray(insurancesData) ? insurancesData : [])
    } catch (error) {
      console.error('Error cargando seguros:', error)
      setInsurances([])
    } finally {
      setLoadingInsurances(false)
    }
  }

  const { mutate: createPatient, isPending: isCreating } = useCustomMutation({
    execute: patientService.createPatient,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Paciente creado exitosamente',
      })
      navigate('/consult-patients')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: updatePatient, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      patientService.updatePatient(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Paciente actualizado exitosamente',
      })
      navigate('/consult-patients')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const onFinish = (values: any) => {
    try {
      if (!values.firstname || !values.lastname) {
        showNotification({
          type: 'error',
          message: 'Nombre y apellido son requeridos',
        })
        return
      }

      const patientData = {
        firstname: values.firstname,
        lastname: values.lastname,
        dni: values.dni || null,
        passport: values.passport || null,
        sex: values.sex || null,
        birthdate: values.birthdate
          ? values.birthdate.format('YYYY-MM-DD')
          : null,
        email: values.email || null,
        phone: values.phone || null,
        cellphone: values.cellphone || null,
        address: values.address || null,
        city: values.city || null,
        insurance_code: values.insurance_code || null,
        insurance_id: values.insurance_id || null,
        active: values.active ?? true,
      }

      if (mode === 'create') {
        createPatient(patientData)
      } else if (mode === 'edit' && id) {
        updatePatient({ id: Number(id), data: patientData })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error procesando los datos del formulario',
      })
    }
  }

  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Crear Paciente'
      case 'edit':
        return 'Editar Paciente'
      case 'view':
        return 'Detalles del Paciente'
      default:
        return 'Paciente'
    }
  }

  const getSubmitButtonText = () => {
    if (mode === 'create') return 'Crear Paciente'
    if (mode === 'edit') return 'Actualizar Paciente'
    return ''
  }

  const isPending = isCreating || isUpdating
  const isViewMode = mode === 'view' && !isEditing

  // Manejador para cuando cambia el seguro seleccionado
  const handleInsuranceChange = (insuranceId: number | null) => {
    if (!insuranceId) {
      form.setFieldsValue({ insurance_code: null })
      return
    }
    const selectedInsurance = insurances.find((i) => i.id === insuranceId)
    form.setFieldsValue({
      insurance_code: selectedInsurance?.provider_code || '',
    })
  }

  if (loadingPatient && id) {
    return (
      <div style={{ padding: '0 16px' }}>
        <Card>
          <Skeleton active />
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24}>
          <Card
            title={
              <Space>
                <UserOutlined />
                {getTitle()}
              </Space>
            }
            extra={
              <Row gutter={8}>
                {mode === 'view' && (
                  <Col>
                    <CustomButton
                      type={isEditing ? 'default' : 'primary'}
                      icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
                      onClick={toggleEditMode}
                    >
                      {isSmallDevice
                        ? null
                        : isEditing
                        ? 'Cancelar Edición'
                        : 'Editar'}
                    </CustomButton>
                  </Col>
                )}
                <Col>
                  <CustomButton
                    type="default"
                    onClick={() => navigate('/consult-patients')}
                  >
                    {isSmallDevice ? (
                      <ArrowLeftOutlined />
                    ) : (
                      'Volver a Pacientes'
                    )}
                  </CustomButton>
                </Col>
              </Row>
            }
          >
            {mode === 'create' && (
              <Alert
                message="Nuevo Paciente"
                description="Complete la información del paciente. Los campos marcados con * son obligatorios."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <CustomForm
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ active: true }}
            >
              {/* INFORMACIÓN PERSONAL */}
              <Card
                type="inner"
                title={
                  <Space>
                    <UserOutlined />
                    <span>Información Personal</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <CustomFormItem label="Nombre" name="firstname" required>
                      <CustomInput
                        placeholder="Nombre del paciente"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<UserOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem label="Apellido" name="lastname" required>
                      <CustomInput
                        placeholder="Apellido del paciente"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<UserOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={8}>
                    <CustomFormItem label="Cédula" name="dni">
                      <CustomInput
                        placeholder="000-0000000-0"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<IdcardOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={8}>
                    <CustomFormItem label="Pasaporte" name="passport">
                      <CustomInput
                        placeholder="Pasaporte"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<IdcardOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={8}>
                    <CustomFormItem label="Sexo" name="sex">
                      <CustomSelect
                        placeholder="Seleccionar sexo"
                        readOnly={isViewMode}
                        size="large"
                      >
                        <Option value="Masculino">Masculino</Option>
                        <Option value="Femenino">Femenino</Option>
                      </CustomSelect>
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Fecha de Nacimiento"
                      name="birthdate"
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Seleccionar fecha"
                        disabled={isViewMode}
                        size="large"
                        format="DD/MM/YYYY"
                        maxDate={dayjs()}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </Card>

              {/* INFORMACIÓN DE CONTACTO */}
              <Card
                type="inner"
                title={
                  <Space>
                    <PhoneOutlined />
                    <span>Información de Contacto</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <CustomFormItem label="Teléfono" name="phone">
                      <CustomInput
                        placeholder="809-000-0000"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<PhoneOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={8}>
                    <CustomFormItem label="Celular" name="cellphone">
                      <CustomInput
                        placeholder="809-000-0000"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<PhoneOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={8}>
                    <CustomFormItem
                      label="Email"
                      name="email"
                      rules={[{ type: 'email', message: 'Email no válido' }]}
                    >
                      <CustomInput
                        placeholder="correo@ejemplo.com"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<MailOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={16}>
                    <CustomFormItem label="Dirección" name="address">
                      <CustomInput
                        placeholder="Calle, número, sector"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<EnvironmentOutlined />}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={8}>
                    <CustomFormItem label="Ciudad" name="city">
                      <CustomInput
                        placeholder="Ciudad"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<EnvironmentOutlined />}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </Card>

              {/* INFORMACIÓN DEL SEGURO */}
              <Card
                type="inner"
                title={
                  <Space>
                    <SafetyOutlined />
                    <span>Información del Seguro</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <CustomFormItem label="Seguro Médico" name="insurance_id">
                      {isViewMode ? (
                        // Mostrar solo el nombre del seguro en modo vista
                        <Text>
                          {insurances.find(
                            (insurance) =>
                              insurance.id ===
                              form.getFieldValue('insurance_id')
                          )?.name || 'Sin seguro'}
                        </Text>
                      ) : (
                        <CustomSelect
                          placeholder="Seleccionar seguro"
                          loading={loadingInsurances}
                          showSearch
                          optionFilterProp="children"
                          readOnly={isViewMode}
                          allowClear
                          size="large"
                          onChange={handleInsuranceChange}
                        >
                          {insurances.map((insurance) => (
                            <Option key={insurance.id} value={insurance.id}>
                              {insurance.name}
                              {insurance.provider_code
                                ? ` (${insurance.provider_code})`
                                : ''}
                            </Option>
                          ))}
                        </CustomSelect>
                      )}
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Código de Seguro"
                      name="insurance_code"
                    >
                      <CustomInput
                        placeholder="NSS o código del seguro"
                        readOnly={isViewMode}
                        size="large"
                        prefix={<SafetyOutlined />}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </Card>

              {/* ESTADO */}
              {/* <Card type="inner" style={{ marginBottom: 16 }}>
                <CustomFormItem name="active" valuePropName="checked">
                  <Space>
                    <input
                      type="checkbox"
                      disabled={isViewMode}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: isViewMode ? 'not-allowed' : 'pointer',
                      }}
                    />
                    <Text strong>Paciente Activo</Text>
                  </Space>
                </CustomFormItem>
              </Card> */}

              {(mode === 'create' || isEditing) && (
                <Row justify="end" gutter={16} style={{ marginTop: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <CustomButton
                      type="default"
                      onClick={() => navigate('/consult-patients')}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      Cancelar
                    </CustomButton>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <CustomButton
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                      icon={
                        mode === 'create' ? (
                          <CheckCircleOutlined />
                        ) : (
                          <SaveOutlined />
                        )
                      }
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {getSubmitButtonText()}
                    </CustomButton>
                  </Col>
                </Row>
              )}
            </CustomForm>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
