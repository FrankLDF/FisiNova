// src/features/reports/pages/InsuranceReportsDashboard.tsx
import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Radio,
  Select,
  DatePicker,
  Space,
  Statistic,
  Alert,
  Table,
  Typography,
  Tabs,
  Tag,
} from 'antd'
import {
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  SafetyOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { CustomButton } from '../../../components/Button/CustomButton'
import reportService from '../services/reportService'
import { showNotification } from '../../../utils/showNotification'
import dayjs from 'dayjs'
import type {
  Insurance,
  ReportPreviewData,
  ReportStats,
  ReportFilters,
  ReportService,
} from '../models/report'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const InsuranceReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'preview'>('generate')
  const [selectedOption, setSelectedOption] = useState<
    'insurance' | 'idoppril' | undefined
  >(undefined)
  const [selectedInsurance, setSelectedInsurance] = useState<
    number | undefined
  >(undefined)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ])
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [loading, setLoading] = useState<boolean>(false)
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsurances()
    loadStats()
  }, [dateRange])

  const loadInsurances = async (): Promise<void> => {
    try {
      const data = await reportService.getInsurances()
      setInsurances(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error cargando seguros:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar los seguros',
      })
    }
  }

  const loadStats = async (): Promise<void> => {
    try {
      const statsData = await reportService.getReportStats({
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
      })
      setStats(statsData)
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const handlePreview = async (): Promise<void> => {
    // Validaciones
    if (!selectedOption) {
      setError('Por favor seleccione un seguro o IDOPPRIL')
      return
    }

    if (selectedOption === 'insurance' && !selectedInsurance) {
      setError('Por favor seleccione un seguro')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const filters: ReportFilters = {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        format: format,
      }

      if (selectedOption === 'idoppril') {
        filters.is_idoppril = true
      } else {
        filters.insurance_id = selectedInsurance
      }

      console.log('=== PREVIEW REQUEST ===')
      console.log('Filtros enviados:', filters)

      const data = await reportService.preview(filters)

      console.log('=== PREVIEW RESPONSE ===')
      console.log('Datos recibidos:', data)
      console.log('Servicios:', data.services?.length || 0)
      console.log('Summary:', data.summary)

      // Validar estructura de datos
      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta inválida del servidor')
      }

      // Mostrar datos incluso si no hay servicios
      setPreviewData(data)

      if (!data.services || data.services.length === 0) {
        showNotification({
          type: 'warning',
          message: `No se encontraron registrosNo hay servicios registrados para el período ${dateRange[0].format(
            'DD/MM/YYYY'
          )} - ${dateRange[1].format('DD/MM/YYYY')}`,
        })
      } else {
        showNotification({
          type: 'success',
          message: `Vista previa generada Se encontraron ${data.services.length} servicio(s)`,
        })
      }

      setActiveTab('preview')
    } catch (error: any) {
      console.error('=== PREVIEW ERROR ===')
      console.error('Error completo:', error)
      console.error('Response:', error.response)
      console.error('Data:', error.response?.data)

      let errorMsg = 'Error al generar vista previa'

      if (error.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.message) {
        errorMsg = error.message
      }

      setError(errorMsg)
      showNotification({
        type: 'error',
        message: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (): Promise<void> => {
    if (!selectedOption) {
      setError('Por favor seleccione un seguro o IDOPPRIL')
      return
    }

    if (selectedOption === 'insurance' && !selectedInsurance) {
      setError('Por favor seleccione un seguro')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const filters: ReportFilters = {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        format: format,
      }

      if (selectedOption === 'idoppril') {
        filters.is_idoppril = true
      } else {
        filters.insurance_id = selectedInsurance
      }

      await reportService.download(filters)

      showNotification({
        type: 'success',
        message: `Reporte ${format.toUpperCase()} descargado exitosamente`,
      })
    } catch (error: any) {
      console.error('Error al descargar:', error)
      const errorMsg =
        error.response?.message || 'Error al descargar el reporte'
      setError(errorMsg)
      showNotification({
        type: 'error',
        message: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Fecha',
      dataIndex: 'authorization_date',
      key: 'authorization_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Afiliado',
      key: 'patient_name',
      render: (record: ReportService) =>
        `${record.patient_name} ${record.patient_last_name}`,
    },
    {
      title: previewData?.is_idoppril ? 'No. Caso' : 'No. Afiliado',
      key: 'identifier',
      render: (record: ReportService) =>
        previewData?.is_idoppril
          ? record.case_number
          : record.patient_insurance_code,
    },
    {
      title: 'Autorización',
      dataIndex: 'authorization_number',
      key: 'authorization_number',
    },
    {
      title: 'Procedimiento',
      dataIndex: 'procedure_description',
      key: 'procedure_description',
      render: (text: string) => {
        const color =
          text === 'CONSULTA' ? 'blue' : text === 'TERAPIA' ? 'purple' : 'red'
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: previewData?.is_idoppril ? 'IDOPPRIL' : 'Seguro',
      dataIndex: 'insurance_amount',
      key: 'insurance_amount',
      align: 'right' as const,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Copago',
      dataIndex: 'patient_amount',
      key: 'patient_amount',
      align: 'right' as const,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right' as const,
      render: (value: number) => <Text strong>${value.toLocaleString()}</Text>,
    },
  ]

  const tabItems = [
    {
      key: 'generate',
      label: (
        <Space>
          <FileTextOutlined />
          Generar Reporte
        </Space>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Selección de Tipo */}
          <Card size="small" title="Tipo de Reporte">
            <Radio.Group
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value)
                if (e.target.value === 'idoppril') {
                  setSelectedInsurance(undefined)
                }
              }}
              style={{ width: '100%' }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <Card
                  size="small"
                  style={{
                    border:
                      selectedOption === 'insurance'
                        ? '2px solid #1890ff'
                        : '1px solid #d9d9d9',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    // Solo cambiar si el click NO es en el Select
                    const target = e.target as HTMLElement
                    if (!target.closest('.ant-select')) {
                      setSelectedOption('insurance')
                    }
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="insurance">
                      <Space>
                        <SafetyOutlined />
                        <Text strong>ARS / Seguros</Text>
                      </Space>
                    </Radio>
                    {selectedOption === 'insurance' && (
                      <Select
                        placeholder="Seleccione un seguro"
                        value={selectedInsurance}
                        onChange={setSelectedInsurance}
                        style={{ width: '100%', marginLeft: 24 }}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onClick={(e) => e.stopPropagation()} // Prevenir propagación
                      >
                        {insurances.map((ins) => (
                          <Option key={ins.id} value={ins.id}>
                            {ins.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Space>
                </Card>

                <Card
                  size="small"
                  style={{
                    border:
                      selectedOption === 'idoppril'
                        ? '2px solid #fa8c16'
                        : '1px solid #d9d9d9',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedOption('idoppril')
                    setSelectedInsurance(undefined)
                  }}
                >
                  <Radio value="idoppril">
                    <Space>
                      <WarningOutlined style={{ color: '#fa8c16' }} />
                      <Text strong>IDOPPRIL (Riesgo Laboral)</Text>
                    </Space>
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </Card>

          {/* Rango de Fechas */}
          <Card size="small" title="Período">
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]!, dates[1]!])
                  loadStats()
                }
              }}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              size="large"
            />
          </Card>

          {/* Formato */}
          <Card size="small" title="Formato de Exportación">
            <Radio.Group
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    style={{
                      border:
                        format === 'pdf'
                          ? '2px solid #1890ff'
                          : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    onClick={() => setFormat('pdf')}
                  >
                    <Space direction="vertical" align="center">
                      <FilePdfOutlined
                        style={{
                          fontSize: 48,
                          color: format === 'pdf' ? '#1890ff' : '#d9d9d9',
                        }}
                      />
                      <Radio value="pdf">
                        <Text strong>PDF</Text>
                      </Radio>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Formato oficial para envío
                      </Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    style={{
                      border:
                        format === 'excel'
                          ? '2px solid #52c41a'
                          : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    onClick={() => setFormat('excel')}
                  >
                    <Space direction="vertical" align="center">
                      <FileExcelOutlined
                        style={{
                          fontSize: 48,
                          color: format === 'excel' ? '#52c41a' : '#d9d9d9',
                        }}
                      />
                      <Radio value="excel">
                        <Text strong>Excel</Text>
                      </Radio>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Para análisis y edición
                      </Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Radio.Group>
          </Card>

          {/* Botones */}
          <Row gutter={16} justify="end">
            <Col xs={24} sm={12} md={6}>
              <CustomButton
                type="default"
                icon={<EyeOutlined />}
                onClick={handlePreview}
                loading={loading}
                block
                size="large"
              >
                Vista Previa
              </CustomButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomButton
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                loading={loading}
                block
                size="large"
              >
                Descargar {format.toUpperCase()}
              </CustomButton>
            </Col>
          </Row>
        </Space>
      ),
    },
    {
      key: 'preview',
      label: (
        <Space>
          <EyeOutlined />
          Vista Previa
        </Space>
      ),
      children: previewData ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Resumen */}
          <Card>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Servicios"
                  value={previewData.summary.total_services}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={
                    previewData.is_idoppril ? 'Monto IDOPPRIL' : 'Monto Seguro'
                  }
                  value={previewData.summary.total_insurance_amount}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Copago Paciente"
                  value={previewData.summary.total_patient_amount}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total"
                  value={previewData.summary.total_amount}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Tabla */}
          <Card
            title={`Reporte - ${previewData.insurance.name}`}
            extra={
              <Space>
                <Text type="secondary">
                  {dayjs(previewData.period.start).format('DD/MM/YYYY')} -{' '}
                  {dayjs(previewData.period.end).format('DD/MM/YYYY')}
                </Text>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={previewData.services}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1200 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                    <Table.Summary.Cell index={0} colSpan={6} align="right">
                      <Text strong style={{ fontSize: 16 }}>
                        TOTAL:
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong style={{ color: '#52c41a' }}>
                        $
                        {previewData.summary.total_insurance_amount.toLocaleString()}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong style={{ color: '#fa8c16' }}>
                        $
                        {previewData.summary.total_patient_amount.toLocaleString()}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                        ${previewData.summary.total_amount.toLocaleString()}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          {/* Botones */}
          <Row gutter={16} justify="space-between">
            <Col>
              <CustomButton onClick={() => setActiveTab('generate')}>
                Volver a Filtros
              </CustomButton>
            </Col>
            <Col>
              <CustomButton
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                loading={loading}
                size="large"
              >
                Descargar {format.toUpperCase()}
              </CustomButton>
            </Col>
          </Row>
        </Space>
      ) : (
        <Card>
          <Space
            direction="vertical"
            align="center"
            style={{ width: '100%', padding: '60px 0' }}
          >
            <EyeOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
            <Title level={4}>No hay vista previa disponible</Title>
            <Text type="secondary">
              Genera un reporte para ver la vista previa
            </Text>
            <CustomButton
              type="primary"
              onClick={() => setActiveTab('generate')}
            >
              Generar Reporte
            </CustomButton>
          </Space>
        </Card>
      ),
    },
  ]

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <Card>
              <Title level={2} style={{ margin: 0 }}>
                Reportería de Seguros e IDOPPRIL
              </Title>
              <Text type="secondary">
                Centro de Rehabilitación Física Fisinova - RNC: 131-66268-4
              </Text>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            )}

            {/* Stats */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Reclamado"
                    value={stats?.current_period_amount || '$0.00'}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Período actual
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Monto Seguros/IDOPPRIL"
                    value={stats?.insurance_amount || '$0.00'}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Pago de ARS
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Copagos"
                    value={stats?.patient_amount || '$0.00'}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Pago de pacientes
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Servicios"
                    value={stats?.services_performed || 0}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Total atendidos
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* Tabs */}
            <Card>
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as 'generate' | 'preview')}
                items={tabItems}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default InsuranceReportsDashboard
