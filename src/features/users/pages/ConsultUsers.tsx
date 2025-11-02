// src/features/users/pages/ConsultUsers.tsx

import { Card, Table, Row, Col, Select, Space, Tag, Tooltip, Input } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import userService from '../services/user'
import type { UserModel, UserFilters } from '../models/user'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'

const { Option } = Select
const { Search } = Input

export const ConsultUsers = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<UserFilters>({
    paginate: 15,
  })
  const [searchValue, setSearchValue] = useState('')

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  })

  const { mutate: deleteUser } = useCustomMutation({
    execute: userService.deleteUser,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Usuario eliminado exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: resetPassword } = useCustomMutation({
    execute: userService.resetPassword,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Contraseña reseteada a: CAMBIAME',
      })
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`)
  }

  const handleEditUser = (userId: number) => {
    navigate(`/users/${userId}/edit`)
  }

  const handleCreateUser = () => {
    navigate('/create-user')
  }

  const handleDeleteUser = (userId: number) => {
    deleteUser(userId)
  }

  const handleResetPassword = (userId: number) => {
    resetPassword(userId)
  }

  const columns: ColumnsType<UserModel> = [
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.name}</span>
          <span style={{ fontSize: 12, color: '#666' }}>{record.email}</span>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, record) => (
        <Space wrap>
          {record.roles && record.roles.length > 0 ? (
            record.roles.map((role) => (
              <Tag key={role.id} color="blue">
                {role.name}
              </Tag>
            ))
          ) : (
            <Tag>Sin roles</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Personal Asociado',
      key: 'employee',
      render: (_, record) =>
        record.employee ? (
          <Space direction="vertical" size={0}>
            <span>
              {record.employee.firstname} {record.employee.lastname}
            </span>
            {record.employee.position && (
              <Tag color="cyan" style={{ fontSize: 11 }}>
                {record.employee.position.name}
              </Tag>
            )}
          </Space>
        ) : (
          <Tag>Sin personal</Tag>
        ),
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record.id!)}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <CustomButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record.id!)}
            />
          </Tooltip>

          <CustomConfirm
            title="¿Resetear contraseña?"
            description="La contraseña será: CAMBIAME"
            onConfirm={() => handleResetPassword(record.id!)}
            okText="Sí, resetear"
            cancelText="Cancelar"
          >
            <Tooltip title="Resetear contraseña">
              <CustomButton type="text" icon={<LockOutlined />} />
            </Tooltip>
          </CustomConfirm>

          <CustomConfirm
            title="¿Estás seguro de eliminar este usuario?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteUser(record.id!)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Tooltip title="Eliminar">
              <CustomButton
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </CustomConfirm>
        </Space>
      ),
    },
  ]

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const clearFilters = () => {
    setFilters({ paginate: 15 })
    setSearchValue('')
  }

  const tableData = usersData?.data?.data || usersData?.data || []
  const pagination = {
    current: usersData?.data?.current_page || 1,
    pageSize: usersData?.data?.per_page || filters.paginate || 15,
    total: usersData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} usuarios`,
    onChange: (page: number, size?: number) => {
      setFilters((prev) => ({ ...prev, paginate: size }))
    },
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Filtros de Búsqueda">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8} lg={8}>
                <label>Buscar:</label>
                <Search
                  placeholder="Nombre o email..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Estado:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Estado"
                  allowClear
                  value={filters.active?.toString()}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, active: value }))
                  }
                >
                  <Option value="true">Activo</Option>
                  <Option value="false">Inactivo</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <CustomButton type="default" onClick={clearFilters}>
                    Limpiar Filtros
                  </CustomButton>
                </Space>
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <CustomButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateUser}
                  style={{ width: '100%' }}
                >
                  Nuevo Usuario
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Lista de Usuarios">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              rowKey="id"
              pagination={pagination}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
