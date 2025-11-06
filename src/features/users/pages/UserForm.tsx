// src/features/users/pages/UserForm.tsx - VERSIÓN MEJORADA

import {
  Card,
  Row,
  Col,
  Form,
  Grid,
  Skeleton,
  Space,
  Tag,
  Divider,
  Alert,
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
import userService from '../services/user'
import { Typography } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  TeamOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { showHandleError } from '../../../utils/handleError'
import type { Role } from '../models/user'
import { useAuth } from '../../../store/auth/AuthContext'

const { Text } = Typography

type FormMode = 'create' | 'edit' | 'view'

export const UserForm = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const isSmallDevice = Grid.useBreakpoint()?.xs || false

  const [mode, setMode] = useState<FormMode>('create')
  const [isEditing, setIsEditing] = useState(false)

  const { user: userLoged } = useAuth()

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

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    loadRoles()
    loadAvailableEmployees()
  }, [])

  useEffect(() => {
    // Si hay datos de usuario y empleado vinculado, lo agregamos a la lista si no está
    if (userData?.data?.employee && id) {
      setEmployees((prev) => {
        const exists = prev.some((e) => e.id === userData.data.employee.id)
        if (!exists) {
          return [userData.data.employee, ...prev]
        }
        return prev
      })
    }
  }, [userData, id])

  useEffect(() => {
    if (userData?.data && id) {
      const user = userData.data

      form.setFieldsValue({
        name: user.name,
        email: user.email,
        active: user.active ?? true,
        employee_id: user.employee?.id,
        roles: user.roles?.map((r: Role) => r.id) || [],
      })
    }
  }, [userData, form, id])

  const loadRoles = async () => {
    try {
      setLoadingRoles(true)
      const response = await userService.getRoles()
      const rolesData = response?.data?.data || response?.data || []
      setRoles(Array.isArray(rolesData) ? rolesData : [])
    } catch (error) {
      console.error('Error cargando roles:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar roles',
      })
      setRoles([])
    } finally {
      setLoadingRoles(false)
    }
  }

  const loadAvailableEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await userService.getAvailableEmployees()
      const employeesData = response?.data?.data || response?.data || []
      setEmployees(Array.isArray(employeesData) ? employeesData : [])
    } catch (error) {
      console.error('Error cargando empleados:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar empleados disponibles',
      })
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const { mutate: createUser, isPending: isCreating } = useCustomMutation({
    execute: userService.createUser,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Usuario creado exitosamente con contraseña: CAMBIAME',
      })
      navigate('/consult-users')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: updateUser, isPending: isUpdating } = useCustomMutation({
    execute: ({ id, data }: { id: number; data: any }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Usuario actualizado exitosamente',
      })
      navigate('/consult-users')
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const onFinish = (values: any) => {
    try {
      if (!values.name || !values.email) {
        showNotification({
          type: 'error',
          message: 'Nombre y email son requeridos',
        })
        return
      }

      if (!values.roles || values.roles.length === 0) {
        showNotification({
          type: 'error',
          message: 'Debe seleccionar al menos un rol',
        })
        return
      }

      const userData = {
        name: values.name,
        email: values.email,
        employee_id: values.employee_id || null,
        roles: values.roles,
        active: values.active ?? true,
      }

      if (mode === 'create') {
        createUser(userData)
      } else if (mode === 'edit' && id) {
        updateUser({ id: Number(id), data: userData })
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
        return 'Crear Usuario'
      case 'edit':
        return 'Editar Usuario'
      case 'view':
        return 'Detalles del Usuario'
      default:
        return 'Usuario'
    }
  }

  const getSubmitButtonText = () => {
    if (mode === 'create') return 'Crear Usuario'
    if (mode === 'edit') return 'Actualizar Usuario'
    return ''
  }

  const isPending = isCreating || isUpdating
  const isViewMode = mode === 'view' && !isEditing

  if (loadingUser && id) {
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
                      disabled={userLoged?.id === Number(id)}
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
                    onClick={() => navigate('/consult-users')}
                  >
                    {isSmallDevice ? (
                      <ArrowLeftOutlined />
                    ) : (
                      'Volver a Usuarios'
                    )}
                  </CustomButton>
                </Col>
              </Row>
            }
          >
            {mode === 'create' && (
              <Alert
                message="Contraseña por defecto"
                description="El usuario se creará con la contraseña: CAMBIAME. El usuario deberá cambiarla en su primer inicio de sesión."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {userData?.data?.employee && mode !== 'create' && (
              <Alert
                message="Personal Vinculado"
                description={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>
                      Este usuario está vinculado a:{' '}
                      <Text strong>
                        {userData.data.employee.firstname}{' '}
                        {userData.data.employee.lastname}
                      </Text>
                      {userData.data.employee.position && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          {userData.data.employee.position.name}
                        </Tag>
                      )}
                    </Text>
                  </Space>
                }
                type="success"
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
              {/* PASO 1: PERSONAL */}
              <Card
                type="inner"
                title={
                  <Space>
                    <TeamOutlined />
                    <span>Paso 1: Personal (Opcional)</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <CustomFormItem
                  label="Seleccionar Personal"
                  name="employee_id"
                  extra="Solo empleados sin usuario asignado. Si no seleccionas, el usuario no estará vinculado."
                >
                  <CustomSelect
                    placeholder="Buscar empleado..."
                    loading={loadingEmployees}
                    showSearch
                    optionFilterProp="children"
                    readOnly={isViewMode}
                    allowClear
                    size="large"
                    notFoundContent={
                      loadingEmployees
                        ? 'Cargando...'
                        : 'No hay personal disponible sin usuario'
                    }
                  >
                    {employees.map((emp: any) => (
                      <Option key={emp.id} value={emp.id}>
                        <Row align="middle" justify="space-between">
                          <Col>
                            <Text
                              strong
                            >{`${emp.firstname} ${emp.lastname}`}</Text>
                          </Col>
                          <Col>
                            {emp.position && (
                              <Tag color="blue">{emp.position.name}</Tag>
                            )}
                          </Col>
                        </Row>
                      </Option>
                    ))}
                  </CustomSelect>
                </CustomFormItem>
              </Card>

              {/* PASO 2: CREDENCIALES */}
              <Card
                type="inner"
                title={
                  <Space>
                    <MailOutlined />
                    <span>Paso 2: Credenciales</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Nombre de Usuario"
                      name="name"
                      required
                    >
                      <CustomInput
                        prefix={<UserOutlined />}
                        placeholder="usuario.sistema"
                        readOnly={isViewMode}
                        size="large"
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} md={12}>
                    <CustomFormItem
                      label="Correo Electrónico"
                      name="email"
                      required
                      rules={[
                        {
                          type: 'email',
                          message: 'Email no válido',
                        },
                      ]}
                    >
                      <CustomInput
                        prefix={<MailOutlined />}
                        placeholder="usuario@ejemplo.com"
                        readOnly={isViewMode}
                        size="large"
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </Card>

              {/* PASO 3: ROLES */}
              <Card
                type="inner"
                title={
                  <Space>
                    <SafetyOutlined />
                    <span>Paso 3: Roles y Permisos</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <CustomFormItem
                  label="Roles del Sistema"
                  name="roles"
                  required
                  extra="Puedes seleccionar múltiples roles para este usuario."
                >
                  <CustomSelect
                    mode="multiple"
                    placeholder="Seleccionar roles..."
                    loading={loadingRoles}
                    showSearch
                    optionFilterProp="children"
                    readOnly={isViewMode}
                    size="large"
                    notFoundContent={
                      loadingRoles ? 'Cargando...' : 'No hay roles disponibles'
                    }
                  >
                    {roles.map((role) => (
                      <Option key={role.id} value={role.id}>
                        <Space direction="vertical" size={0}>
                          <Text strong>{role.name}</Text>
                          {role.description && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {role.description}
                            </Text>
                          )}
                        </Space>
                      </Option>
                    ))}
                  </CustomSelect>
                </CustomFormItem>

                <Divider style={{ margin: '16px 0' }} />

                {/* <CustomFormItem name="active" valuePropName="checked">
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
                    <Text strong>Usuario Activo</Text>
                  </Space>
                </CustomFormItem> */}
              </Card>

              {(mode === 'create' || isEditing) && (
                <Row justify="end" gutter={16} style={{ marginTop: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <CustomButton
                      type="default"
                      onClick={() => navigate('/consult-users')}
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
