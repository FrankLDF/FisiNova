// src/features/insurances/pages/ConsultInsurances.tsx

import { Card, Table, Row, Col, Select, Space, Tag, Tooltip, Input } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  PoweroffOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import insuranceService from '../services/insurance'
import type { InsuranceModel, InsuranceFilters } from '../models/insurance'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'
import { InsuranceStatisticsModal } from '../components/InsuranceStatisticsModal'

const { Option } = Select
const { Search } = Input

export const ConsultInsurances = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<InsuranceFilters>({
    paginate: 15,
  })
  const [searchValue, setSearchValue] = useState('')
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | null>(
    null
  )
  const [showStatsModal, setShowStatsModal] = useState(false)

  const {
    data: insurancesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['insurances', filters],
    queryFn: () => insuranceService.getInsurances(filters),
  })

  const { mutate: deleteInsurance } = useCustomMutation({
    execute: insuranceService.deleteInsurance,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Seguro desactivado exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const { mutate: toggleActive } = useCustomMutation({
    execute: insuranceService.toggleActive,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Estado del seguro actualizado',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleViewInsurance = (insuranceId: number) => {
    navigate(`/insurances/${insuranceId}`)
  }

  const handleEditInsurance = (insuranceId: number) => {
    navigate(`/insurances/${insuranceId}/edit`)
  }

  const handleCreateInsurance = () => {
    navigate('/create-insurance')
  }

  const handleDeleteInsurance = (insuranceId: number) => {
    deleteInsurance(insuranceId)
  }

  const handleToggleActive = (insuranceId: number) => {
    toggleActive(insuranceId)
  }

  const handleShowStatistics = (insuranceId: number) => {
    setSelectedInsuranceId(insuranceId)
    setShowStatsModal(true)
  }

  const columns: ColumnsType<InsuranceModel> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Código Proveedor',
      dataIndex: 'provider_code',
      key: 'provider_code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
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
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('es-DO'),
      sorter: (a, b) =>
        new Date(a.created_at || '').getTime() -
        new Date(b.created_at || '').getTime(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver estadísticas">
            <CustomButton
              type="text"
              icon={<BarChartOutlined />}
              onClick={() => handleShowStatistics(record.id!)}
            />
          </Tooltip>

          <Tooltip title="Ver detalles">
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewInsurance(record.id!)}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <CustomButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditInsurance(record.id!)}
            />
          </Tooltip>

          <CustomConfirm
            title={`¿${record.active ? 'Desactivar' : 'Activar'} seguro?`}
            description={`El seguro será ${
              record.active ? 'desactivado' : 'activado'
            }`}
            onConfirm={() => handleToggleActive(record.id!)}
            okText="Sí, continuar"
            cancelText="Cancelar"
          >
            <Tooltip title={record.active ? 'Desactivar' : 'Activar'}>
              <CustomButton
                type="text"
                icon={<PoweroffOutlined />}
                style={{ color: record.active ? '#ff4d4f' : '#52c41a' }}
              />
            </Tooltip>
          </CustomConfirm>

          {/* <CustomConfirm
            title="¿Estás seguro de eliminar este seguro?"
            description="Esta acción desactivará el seguro permanentemente"
            onConfirm={() => handleDeleteInsurance(record.id!)}
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
          </CustomConfirm> */}
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

  const tableData = insurancesData?.data?.data || insurancesData?.data || []
  const pagination = {
    current: insurancesData?.data?.current_page || 1,
    pageSize: insurancesData?.data?.per_page || filters.paginate || 15,
    total: insurancesData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} seguros`,
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
                  placeholder="Nombre o código..."
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
                  onClick={handleCreateInsurance}
                  style={{ width: '100%' }}
                >
                  Nuevo Seguro
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Lista de Seguros">
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

      {/* Modal de Estadísticas */}
      {selectedInsuranceId && (
        <InsuranceStatisticsModal
          insuranceId={selectedInsuranceId}
          open={showStatsModal}
          onClose={() => {
            setShowStatsModal(false)
            setSelectedInsuranceId(null)
          }}
        />
      )}
    </div>
  )
}
