// src/features/insurances/pages/InsuranceForm.tsx

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
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomForm } from '../../../components/form/CustomForm'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import insuranceService from '../services/insurance'
import { Typography } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'

const { Text } = Typography

type FormMode = 'create' | 'edit' | 'view'

export const InsuranceForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const isSmallDevice = Grid.useBreakpoint()?.xs || false

  const [mode, setMode] = useState<FormMode>('create')
  const [isEditing, setIsEditing] = useState(false)

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

  const { data: insuranceData, isLoading: loadingInsurance } = useQuery({
    queryKey: ['insurance', id],
    queryFn: () => insuranceService.getInsuranceById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (insuranceData?.data && id) {
      const insurance = insuranceData.data

      form.setFieldsValue({
        name: insurance.name,
        provider_code: insurance.provider_code,
        active: insurance.active ?? true,
      })
    }
  }, [insuranceData, form, id])

  const { mutate: createInsurance, isPending: isCreating } = useCustomMutation({
    execute: insuranceService.createInsurance,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Seguro creado exitosamente',
      })
      navigate('/consult-insurances')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: updateInsurance, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      insuranceService.updateInsurance(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Seguro actualizado exitosamente',
      })
      navigate('/consult-insurances')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const onFinish = (values: any) => {
    try {
      if (!values.name || !values.provider_code) {
        showNotification({
          type: 'error',
          message: 'Nombre y código de proveedor son requeridos',
        })
        return
      }

      const insuranceData = {
        name: values.name,
        provider_code: values.provider_code,
        active: values.active ?? true,
      }

      if (mode === 'create') {
        createInsurance(insuranceData)
      } else if (mode === 'edit' && id) {
        updateInsurance({ id: Number(id), data: insuranceData })
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
        return 'Crear Seguro Médico'
      case 'edit':
        return 'Editar Seguro Médico'
      case 'view':
        return 'Detalles del Seguro'
      default:
        return 'Seguro Médico'
    }
  }

  const getSubmitButtonText = () => {
    if (mode === 'create') return 'Crear Seguro'
    if (mode === 'edit') return 'Actualizar Seguro'
    return ''
  }

  const isPending = isCreating || isUpdating
  const isViewMode = mode === 'view' && !isEditing

  if (loadingInsurance && id) {
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
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <SafetyOutlined />
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
                    onClick={() => navigate('/consult-insurances')}
                  >
                    {isSmallDevice ? <ArrowLeftOutlined /> : 'Volver a Seguros'}
                  </CustomButton>
                </Col>
              </Row>
            }
          >
            {mode === 'create' && (
              <Alert
                message="Nuevo Seguro Médico"
                description="Complete la información del seguro para poder asociarlo a pacientes y citas."
                type="info"
                showIcon
                icon={<FileProtectOutlined />}
                style={{ marginBottom: 24 }}
              />
            )}

            <CustomForm
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ active: true }}
            >
              {/* INFORMACIÓN BÁSICA */}
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
                    <CustomFormItem
                      label="Nombre del Seguro"
                      name="name"
                      required
                      rules={[
                        {
                          max: 255,
                          message: 'Máximo 255 caracteres',
                        },
                      ]}
                    >
                      <CustomInput
                        placeholder="Ej: ARS Humano, Seguros Universal"
                        readOnly={isViewMode}
                        size="large"
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Código del Proveedor"
                      name="provider_code"
                      required
                      extra="Código único que identifica al proveedor"
                      rules={[
                        {
                          max: 255,
                          message: 'Máximo 255 caracteres',
                        },
                      ]}
                    >
                      <CustomInput
                        placeholder="Ej: ARS001, UNIV002"
                        readOnly={isViewMode}
                        size="large"
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

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
                    <Text strong>Seguro Activo</Text>
                  </Space>
                </CustomFormItem>

                {mode !== 'create' && (
                  <Alert
                    message="Nota"
                    description="Si desactivas este seguro, no podrá ser seleccionado en nuevas citas o pacientes."
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>

              {(mode === 'create' || isEditing) && (
                <Row justify="end" gutter={16} style={{ marginTop: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <CustomButton
                      type="default"
                      onClick={() => navigate('/consult-insurances')}
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
