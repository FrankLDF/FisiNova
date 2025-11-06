import { Card, Table, Row, Col, Space, Tag, Tooltip, Input } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import patientService from '../services/patient'
import type { Patient } from '../models/patient'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'

const { Search } = Input

export const ConsultPatients = () => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')

  const {
    data: patientsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['patients', searchValue],
    queryFn: () => patientService.getPatients(searchValue),
  })
  console.log({ patientsData })
  const { mutate: deletePatient } = useCustomMutation({
    execute: patientService.deletePatient,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Paciente eliminado exitosamente',
      })
      refetch()
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleViewPatient = (patientId: number) => {
    navigate(`/patients/${patientId}`)
  }

  const handleEditPatient = (patientId: number) => {
    navigate(`/patients/${patientId}/edit`)
  }

  const handleCreatePatient = () => {
    navigate('/create-patient')
  }

  const handleDeletePatient = (patientId: number) => {
    deletePatient(patientId)
  }

  const calculateAge = (birthdate?: string): number | null => {
    if (!birthdate) return null
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth?.getFullYear()
    const monthDiff = today.getMonth() - birth?.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth?.getDate())
    ) {
      age--
    }
    return age
  }

  const columns: ColumnsType<Patient> = [
    {
      title: 'Paciente',
      key: 'patient',
      render: (_, record) => {
        const age = calculateAge(record?.birthdate)
        return (
          <Space direction="vertical" size={0}>
            <Space>
              <UserOutlined />
              <span style={{ fontWeight: 500 }}>
                {record?.firstname} {record?.lastname}
              </span>
            </Space>
            {record?.dni && (
              <span style={{ fontSize: 12, color: '#666' }}>
                Cédula: {record?.dni}
              </span>
            )}
            {age !== null && (
              <Tag color="blue" style={{ fontSize: 11, marginTop: 4 }}>
                {age} años
              </Tag>
            )}
          </Space>
        )
      },
      sorter: (a, b) => a?.firstname?.localeCompare(b?.firstname),
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record?.cellphone && (
            <Space size={4}>
              <PhoneOutlined style={{ fontSize: 12, color: '#1890ff' }} />
              <span style={{ fontSize: 12 }}>{record?.cellphone}</span>
            </Space>
          )}
          {record?.email && (
            <span style={{ fontSize: 12, color: '#666' }}>{record?.email}</span>
          )}
          {record?.city && (
            <Space size={4}>
              <EnvironmentOutlined style={{ fontSize: 12, color: '#52c41a' }} />
              <span style={{ fontSize: 12 }}>{record?.city}</span>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Seguro',
      key: 'insurance',
      render: (_, record) =>
        record?.insurance ? (
          <Space direction="vertical" size={0}>
            <Space size={4}>
              <SafetyOutlined style={{ fontSize: 12, color: '#1890ff' }} />
              <span style={{ fontSize: 12 }}>{record?.insurance?.name}</span>
            </Space>
            {record?.insurance_code && (
              <Tag color="cyan" style={{ fontSize: 11 }}>
                Código: {record?.insurance_code}
              </Tag>
            )}
          </Space>
        ) : (
          <Tag>Sin seguro</Tag>
        ),
    },
    {
      title: 'Sexo',
      dataIndex: 'sex',
      key: 'sex',
      render: (sex: string) => {
        if (!sex) return <Tag>No especificado</Tag>
        const firstLetter = sex.trim().charAt(0).toLowerCase()
        let label = 'No especificado'
        let color = 'default'
        if (firstLetter === 'f') {
          label = 'Femenino'
          color = 'pink'
        } else if (firstLetter === 'm') {
          label = 'Masculino'
          color = 'blue'
        }
        return <Tag color={color}>{label}</Tag>
      },
      filters: [
        { text: 'Masculino', value: 'Masculino' },
        { text: 'Femenino', value: 'Femenino' },
      ],
      onFilter: (value, record) => {
        const firstLetter = record?.sex?.trim().charAt(0).toLowerCase()
        if (value === 'Masculino') return firstLetter === 'm'
        if (value === 'Femenino') return firstLetter === 'f'
        return false
      },
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
      onFilter: (value, record) => record?.active === value,
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewPatient(record?.id!)}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <CustomButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditPatient(record?.id!)}
            />
          </Tooltip>

          {/* <CustomConfirm
            title="¿Estás seguro de eliminar este paciente?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeletePatient(record?.id!)}
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
    setSearchValue(value)
  }

  const tableData = Array.isArray(patientsData?.data?.data)
    ? patientsData.data?.data
    : []
  console.log({ tableData })

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Buscar Pacientes">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16}>
                <Search
                  placeholder="Buscar por nombre, cédula o email..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                  size="large"
                />
              </Col>

              <Col xs={24} md={8}>
                <CustomButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreatePatient}
                  size="large"
                  style={{ width: '100%' }}
                >
                  Nuevo Paciente
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title={
              <Space>
                <UserOutlined />
                Lista de Pacientes
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number) => `Total: ${total} pacientes`,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
