import React, { useState, useEffect } from 'react'
import {
  Modal,
  Table,
  Input,
  Row,
  Col,
  Space,
  Tag,
  Typography,
  Card,
  Divider,
  Empty,
} from 'antd'
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { Patient } from '../../features/patient/models/patient'
import patientService from '../../features/patient/services/patient'
import { CustomButton } from '../Button/CustomButton'
import dayjs from 'dayjs'

const { Text, Title } = Typography
const { Search } = Input

interface PatientSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (patient: Patient) => void
  selectedPatientId?: number | null
  title?: string
  allowClear?: boolean
}

interface PatientFilters {
  search?: string
  city?: string
  active?: boolean
}

export const PatientSelectorModal: React.FC<PatientSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedPatientId,
  title = "Seleccionar Paciente",
  allowClear = true,
}) => {
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    active: true,
  })
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchValue, setSearchValue] = useState('')

  const {
    data: patientsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['patients-modal', filters],
    queryFn: () => patientService.getPatients(filters.search),
    enabled: open,
  })

  const patients = patientsData?.data?.data || patientsData?.data || []

  useEffect(() => {
    if (!open) {
      setSelectedPatient(null)
      setSearchValue('')
    }
  }, [open])

  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const patient = patients.find((p: Patient) => p.id === selectedPatientId)
      if (patient) {
        setSelectedPatient(patient)
      }
    }
  }, [selectedPatientId, patients])

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleRowSelect = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const handleConfirm = () => {
    if (selectedPatient) {
      onSelect(selectedPatient)
      onClose()
    }
  }

  const handleClear = () => {
    setSelectedPatient(null)
    onSelect(null as any)
    onClose()
  }

  const columns: ColumnsType<Patient> = [
    {
      title: 'Nombre Completo',
      key: 'fullName',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {`${record.firstname || ''} ${record.lastname || ''}`}
          </Text>
          {record.dni && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <IdcardOutlined /> {record.dni}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.phone && (
            <Text style={{ fontSize: 12 }}>
              <PhoneOutlined /> {record.phone}
            </Text>
          )}
          {record.email && (
            <Text style={{ fontSize: 12 }}>
              <MailOutlined /> {record.email}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Información',
      key: 'info',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.city && (
            <Text style={{ fontSize: 12 }}>
              <EnvironmentOutlined /> {record.city}
            </Text>
          )}
          {record.birthdate && (
            <Text style={{ fontSize: 12 }}>
              <CalendarOutlined /> {dayjs(record.birthdate).format('DD/MM/YYYY')}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Seguro',
      key: 'insurance',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.insurance?.name && (
            <Tag color="blue">{record.insurance.name}</Tag>
          )}
          {record.insurance_code && (
            <Text style={{ fontSize: 11 }} type="secondary">
              {record.insurance_code}
            </Text>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      footer={[
        <Space key="footer-actions">
          <CustomButton onClick={onClose}>
            Cancelar
          </CustomButton>
          {allowClear && (
            <CustomButton 
              onClick={handleClear}
              icon={<ClearOutlined />}
            >
              Limpiar Selección
            </CustomButton>
          )}
          <CustomButton
            type="primary"
            onClick={handleConfirm}
            disabled={!selectedPatient}
          >
            Seleccionar Paciente
          </CustomButton>
        </Space>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Search
                placeholder="Buscar por nombre, DNI o email..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {patients.length} paciente(s) encontrado(s)
              </Text>
            </Col>
          </Row>
        </Card>

        {selectedPatient && (
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Row align="middle">
              <Col span={2}>
                <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              </Col>
              <Col span={22}>
                <Space direction="vertical" size={0}>
                  <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                    Paciente Seleccionado:
                  </Title>
                  <Text strong>
                    {`${selectedPatient.firstname} ${selectedPatient.lastname}`}
                  </Text>
                  <Space>
                    {selectedPatient.dni && <Text type="secondary">DNI: {selectedPatient.dni}</Text>}
                    {selectedPatient.phone && <Text type="secondary">Tel: {selectedPatient.phone}</Text>}
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Table
          columns={columns}
          dataSource={patients}
          loading={isLoading}
          rowKey="id"
          size="small"
          scroll={{ y: 400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `Total: ${total} pacientes`,
          }}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedPatient ? [selectedPatient.id!] : [],
            onSelect: (record) => handleRowSelect(record),
          }}
          onRow={(record) => ({
            onClick: () => handleRowSelect(record),
            style: {
              cursor: 'pointer',
              backgroundColor: selectedPatient?.id === record.id ? '#e6f7ff' : undefined,
            },
          })}
          locale={{
            emptyText: (
              <Empty
                description="No se encontraron pacientes"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Space>
    </Modal>
  )
}