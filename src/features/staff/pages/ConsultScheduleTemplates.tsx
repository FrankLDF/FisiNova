// src/features/staff/pages/ConsultScheduleTemplates.tsx

import { Card, Table, Row, Col, Space, Tag, Tooltip, Input } from 'antd'
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
import type { ScheduleTemplate, ScheduleTemplateFilters } from '../models/employee'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'
import { DAY_OF_WEEK_MAP } from '../models/employee'

const { Search } = Input

export const ConsultScheduleTemplates = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ScheduleTemplateFilters>({
    paginate: 15,
  })

  const [searchValue, setSearchValue] = useState('')

  const {
    data: templatesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['schedule-templates', filters],
    queryFn: () => staffService.getScheduleTemplates(filters),
  })

  const { mutate: deleteTemplate } = useCustomMutation({
    execute: staffService.deleteScheduleTemplate,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Plantilla eliminada exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleEditTemplate = (templateId: number) => {
    navigate(`/schedule-templates/${templateId}/edit`)
  }

  const handleCreateTemplate = () => {
    navigate('/create-schedule-template')
  }

  const handleDeleteTemplate = (templateId: number) => {
    deleteTemplate(templateId)
  }

  const columns: ColumnsType<ScheduleTemplate> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => description || '-',
    },
    {
      title: 'Días Configurados',
      key: 'schedule_days',
      render: (_, record) => {
        const days = record.schedule_days || []
        if (days.length === 0) return <Tag>Sin días</Tag>

        return (
          <Space wrap>
            {days.slice(0, 3).map((day, index) => (
              <Tooltip
                key={index}
                title={`${day.start_time} - ${day.end_time}`}
              >
                <Tag color="blue">
                  {day.day_of_week
                    ? DAY_OF_WEEK_MAP[day.day_of_week]
                    : 'Flexible'}
                </Tag>
              </Tooltip>
            ))}
            {days.length > 3 && <Tag>+{days.length - 3} más</Tag>}
          </Space>
        )
      },
    },
    {
      title: 'Total de Días',
      key: 'total_days',
      align: 'center',
      render: (_, record) => (
        <Tag color="green">{record.schedule_days?.length || 0}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {/* <Tooltip title="Ver detalles">
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleEditTemplate(record.id!)}
            />
          </Tooltip> */}

          <Tooltip title="Editar">
            <CustomButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record.id!)}
            />
          </Tooltip>

          <CustomConfirm
            title="¿Estás seguro de eliminar esta plantilla?"
            description="Esta acción no se puede deshacer. Si hay asignaciones activas no se podrá eliminar."
            onConfirm={() => handleDeleteTemplate(record.id!)}
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

  const tableData = templatesData?.data?.data || templatesData?.data || []
  const pagination = {
    current: templatesData?.data?.current_page || 1,
    pageSize: templatesData?.data?.per_page || filters.paginate || 15,
    total: templatesData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} plantillas`,
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
              <Col xs={24} sm={12} md={10} lg={10}>
                <label>Buscar:</label>
                <Search
                  placeholder="Nombre de plantilla..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <CustomButton type="default" onClick={clearFilters}>
                    Limpiar Filtros
                  </CustomButton>
                </Space>
              </Col>

              <Col xs={24} sm={12} md={8} lg={8}>
                <CustomButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateTemplate}
                  style={{ width: '100%' }}
                >
                  Nueva Plantilla de Horario
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Plantillas de Horarios">
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
