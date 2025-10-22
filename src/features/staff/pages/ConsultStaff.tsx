// src/features/staff/pages/ConsultStaff.tsx

import { Card, Table, Row, Col, Select, Space, Tag, Tooltip, Input } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import staffService from '../services/staff'
import type { Staff, StaffFilters } from '../models/staff'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'

const { Option } = Select
const { Search } = Input

export const ConsultStaff = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<StaffFilters>({
    paginate: 15,
    is_active: true,
  })

  const [searchValue, setSearchValue] = useState('')

  const {
    data: staffData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffService.getStaff(filters),
  })

  const { mutate: deleteStaff } = useCustomMutation({
    execute: staffService.deleteStaff,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Personal eliminado exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleViewStaff = (staffId: number) => {
    navigate(`/staff/${staffId}`)
  }

  const handleEditStaff = (staffId: number) => {
    navigate(`/staff/${staffId}/edit`)
  }

  const handleCreateStaff = () => {
    navigate('/create-staff')
  }

  const handleDeleteStaff = (staffId: number) => {
    deleteStaff(staffId)
  }

  const columns: ColumnsType<Staff> = [
    {
      title: 'Nombre Completo',
      key: 'fullName',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>
            {`${record.first_name} ${record.last_name}`}
          </span>
          {record.email && (
            <span style={{ fontSize: 12, color: '#666' }}>{record.email}</span>
          )}
        </Space>
      ),
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: 'Posición',
      key: 'position',
      render: (_, record) => (
        <Tag color="blue">{record.position?.name || 'Sin asignar'}</Tag>
      ),
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? 'Activo' : 'Inactivo'}
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
              onClick={() => handleViewStaff(record.id!)}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <CustomButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditStaff(record.id!)}
            />
          </Tooltip>

          <CustomConfirm
            title="¿Estás seguro de eliminar este personal?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteStaff(record.id!)}
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

  const handleFilterChange = (key: keyof StaffFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const clearFilters = () => {
    setFilters({ paginate: 15, is_active: true })
    setSearchValue('')
  }

  const tableData = staffData?.data?.data || staffData?.data || []
  const pagination = {
    current: staffData?.data?.current_page || 1,
    pageSize: staffData?.data?.per_page || filters.paginate || 15,
    total: staffData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} personal`,
    onChange: (page: number, size?: number) => {
      handleFilterChange('paginate', size)
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
                  placeholder="Nombre, email..."
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
                  value={filters.is_active?.toString()}
                  onChange={(value) => handleFilterChange('is_active', value)}
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
                  onClick={handleCreateStaff}
                  style={{ width: '100%' }}
                >
                  Nuevo Personal
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Lista de Personal">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              rowKey="id"
              pagination={pagination}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
