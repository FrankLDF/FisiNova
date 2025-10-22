// src/features/staff/pages/StaffForm.tsx

import { Card, Row, Col, Form, Grid, Skeleton } from 'antd'
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
import staffService from '../services/staff'
import { Typography } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'

const { Title } = Typography

interface Position {
  id: number
  name: string
  description?: string
}

type FormMode = 'create' | 'edit' | 'view'

export const StaffForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [positions, setPositions] = useState<Position[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)
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

  const { data: staffData, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.getStaffById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    loadPositions()
  }, [])

  useEffect(() => {
    if (staffData?.data && id) {
      const staff = staffData.data

      form.setFieldsValue({
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        phone: staff.phone,
        position_id: staff.position_id,
        is_active: staff.is_active,
      })
    }
  }, [staffData, form, id])

  const loadPositions = async () => {
    try {
      setLoadingPositions(true)
      const response = await staffService.getPositions()
      console.log({ response })
      const positionData = response?.data?.data || response?.data || []
      setPositions(Array.isArray(positionData) ? positionData : [])
    } catch (error) {
      console.error('Error cargando posiciones:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar posiciones',
      })
      setPositions([])
    } finally {
      setLoadingPositions(false)
    }
  }

  const { mutate: createStaff, isPending: isCreating } = useCustomMutation({
    execute: staffService.createStaff,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Personal creado exitosamente',
      })
      navigate('/consult-staff')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: updateStaff, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      staffService.updateStaff(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Personal actualizado exitosamente',
      })
      navigate('/consult-staff')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const onFinish = (values: any) => {
    try {
      if (!values.first_name || !values.last_name) {
        showNotification({
          type: 'error',
          message: 'Nombre y apellido son requeridos',
        })
        return
      }

      if (!values.position_id) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar una posición',
        })
        return
      }

      const staffData = {
        ...values,
        is_active: values.is_active ?? true,
      }

      if (mode === 'create') {
        createStaff(staffData)
      } else if (mode === 'edit' && id) {
        updateStaff({ id: Number(id), data: staffData })
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
        return 'Crear Personal'
      case 'edit':
        return 'Editar Personal'
      case 'view':
        return 'Detalles del Personal'
      default:
        return 'Personal'
    }
  }

  const getSubmitButtonText = () => {
    if (mode === 'create') return 'Crear Personal'
    if (mode === 'edit') return 'Actualizar Personal'
    return ''
  }

  const isPending = isCreating || isUpdating
  const isViewMode = mode === 'view' && !isEditing

  if (loadingStaff && id) {
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
        <Col xs={24} sm={24}>
          <Card
            title={getTitle()}
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
                    onClick={() => navigate('/consult-staff')}
                  >
                    {isSmallDevice ? (
                      <ArrowLeftOutlined />
                    ) : (
                      'Volver a Consultas'
                    )}
                  </CustomButton>
                </Col>
              </Row>
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
                  Información Personal
                </Title>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <CustomFormItem label="Nombre" name="first_name" required>
                      <CustomInput
                        placeholder="Nombre del personal"
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem label="Apellido" name="last_name" required>
                      <CustomInput
                        placeholder="Apellido del personal"
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Email"
                      name="email"
                      rules={[
                        {
                          type: 'email',
                          message: 'Email no válido',
                        },
                      ]}
                    >
                      <CustomInput
                        placeholder="correo@ejemplo.com"
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem label="Teléfono" name="phone">
                      <CustomInput
                        placeholder="Número de teléfono"
                        readOnly={isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Posición"
                      name="position_id"
                      required
                    >
                      <CustomSelect
                        placeholder="Seleccionar posición..."
                        loading={loadingPositions}
                        showSearch
                        optionFilterProp="children"
                        readOnly={isViewMode}
                        notFoundContent={
                          loadingPositions
                            ? 'Cargando...'
                            : 'No hay posiciones disponibles'
                        }
                      >
                        {positions.map((position) => (
                          <Option key={position.id} value={position.id}>
                            {position.name}
                          </Option>
                        ))}
                      </CustomSelect>
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem label="Estado" name="is_active">
                      <CustomSelect
                        placeholder="Estado del personal"
                        readOnly={isViewMode}
                      >
                        <Option value={true}>Activo</Option>
                        <Option value={false}>Inactivo</Option>
                      </CustomSelect>
                    </CustomFormItem>
                  </Col>
                </Row>
              </div>

              {(mode === 'create' || isEditing) && (
                <Row justify="end" gutter={16} style={{ marginTop: '24px' }}>
                  <Col xs={24} sm={12} md={6}>
                    <CustomButton
                      type="default"
                      onClick={() => navigate('/consult-staff')}
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
                      icon={mode === 'create' ? undefined : <SaveOutlined />}
                      style={{ width: '100%', minHeight: '40px' }}
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
