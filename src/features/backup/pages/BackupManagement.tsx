// src/features/backup/pages/BackupManagement.tsx

import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  Tag,
  Tooltip,
  Modal,
  Progress,
  Alert,
  Empty,
} from 'antd'
import {
  DatabaseOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  HddOutlined,
  FileProtectOutlined,
  ExclamationCircleOutlined,
  CloudDownloadOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { CustomConfirm } from '../../../components/pop-confirm/CustomConfirm'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import backupService from '../services/backup'
import type { Backup, BackupStats } from '../models/backup'
import type { ColumnsType } from 'antd/es/table'
import { showHandleError } from '../../../utils/handleError'
import dayjs from 'dayjs'

const { confirm } = Modal

export const BackupManagement = () => {
  const [loading, setLoading] = useState(false)

  // Queries
  const {
    data: backupsData,
    isLoading: loadingBackups,
    refetch: refetchBackups,
  } = useQuery({
    queryKey: ['backups'],
    queryFn: () => backupService.getBackups(),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const {
    data: statsData,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['backup-stats'],
    queryFn: () => backupService.getStats(),
    refetchInterval: 30000,
  })

  // Mutations
  const { mutate: createBackup, isPending: isCreating } = useCustomMutation({
    execute: backupService.createBackup,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Backup creado exitosamente',
      })
      refetchBackups()
      refetchStats()
    },
    onError: showHandleError,
  })

  const { mutate: deleteBackup } = useCustomMutation({
    execute: backupService.deleteBackup,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Backup eliminado exitosamente',
      })
      refetchBackups()
      refetchStats()
    },
    onError: showHandleError,
  })

  const { mutate: cleanBackups, isPending: isCleaning } = useCustomMutation({
    execute: backupService.cleanBackups,
    onSuccess: (data: any) => {
      showNotification({
        type: 'success',
        message: `Se eliminaron ${
          data?.data?.deleted_count || 0
        } backup(s) antiguos`,
      })
      refetchBackups()
      refetchStats()
    },
    onError: showHandleError,
  })

  // Handlers
  const handleCreateBackup = () => {
    confirm({
      title: '¿Crear nuevo backup?',
      icon: <ExclamationCircleOutlined />,
      content: 'Se creará una copia de seguridad completa de la base de datos.',
      okText: 'Sí, crear',
      cancelText: 'Cancelar',
      onOk: () => {
        createBackup({ type: 'manual' })
      },
    })
  }

  const handleDownloadBackup = async (filename: string) => {
    try {
      setLoading(true)
      await backupService.downloadBackup(filename)
      showNotification({
        type: 'success',
        message: 'Backup descargado exitosamente',
      })
    } catch (error) {
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBackup = (filename: string) => {
    deleteBackup(filename)
  }

  const handleCleanBackups = () => {
    confirm({
      title: '¿Limpiar backups antiguos?',
      icon: <ExclamationCircleOutlined />,
      content:
        'Se mantendrán solo los últimos 5 backups. Esta acción no se puede deshacer.',
      okText: 'Sí, limpiar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: () => {
        cleanBackups({ keep_count: 5 })
      },
    })
  }

  // Data
  const backups = Array.isArray(backupsData?.data?.backups)
    ? backupsData.data.backups
    : []

  const stats: BackupStats = {
    total_backups: statsData?.data?.total_backups
      ? statsData.data.total_backups
      : 0,
    total_size: statsData?.data?.total_size ? statsData.data.total_size : 0,
    total_size_formatted: statsData?.data?.total_size
      ? statsData.data.total_size + ' B'
      : '0 B',
    last_backup_date: statsData?.data?.newest_backup
      ? dayjs(statsData.data.newest_backup).format('DD/MM/YYYY HH:mm')
      : undefined,
    disk_usage: statsData?.data?.total_size_mb
      ? statsData.data.total_size_mb
      : { percentage: 0 },
  }

  // Columns
  const columns: ColumnsType<Backup> = [
    {
      title: 'Nombre del Archivo',
      dataIndex: 'filename',
      key: 'filename',
      render: (filename: string) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 13 }}>
            {filename}
          </span>
        </Space>
      ),
    },
    {
      title: 'Tamaño',
      dataIndex: 'size_mb',
      key: 'size',
      width: 120,
      align: 'right',
      render: (size: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {`${size} MB`}
        </Tag>
      ),
    },
    // {
    //   title: 'Tipo',
    //   dataIndex: 'type',
    //   key: 'type',
    //   width: 100,
    //   render: (type: string) => {
    //     const colors = {
    //       manual: 'green',
    //       automatic: 'blue',
    //     }
    //     const labels = {
    //       manual: 'Manual',
    //       automatic: 'Automático',
    //     }
    //     return (
    //       <Tag color={colors[type as keyof typeof colors] || 'default'}>
    //         {labels[type as keyof typeof labels] || type}
    //       </Tag>
    //     )
    //   },
    // },
    {
      title: 'Fecha de Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(date).format('DD/MM/YYYY')}</span>
          <span style={{ fontSize: 12, color: '#666' }}>
            {dayjs(date).format('HH:mm:ss')}
          </span>
        </Space>
      ),
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Antigüedad',
      key: 'age',
      width: 120,
      render: (_, record) => {
        const days = dayjs().diff(dayjs(record.created_at), 'days')
        const color = days > 30 ? 'red' : days > 7 ? 'orange' : 'green'
        return (
          <Tag color={color} icon={<ClockCircleOutlined />}>
            {days === 0 ? 'Hoy' : days === 1 ? '1 día' : `${days} días`}
          </Tag>
        )
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Descargar">
            <CustomButton
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadBackup(record.filename)}
              loading={loading}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>

          <CustomConfirm
            title="¿Eliminar este backup?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteBackup(record.filename)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Tooltip title="Eliminar">
              <CustomButton type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </CustomConfirm>
        </Space>
      ),
    },
  ]

  const diskUsagePercentage = stats?.disk_usage?.percentage ?? 0
  const diskUsageColor =
    diskUsagePercentage > 90
      ? '#ff4d4f'
      : diskUsagePercentage > 70
      ? '#faad14'
      : '#52c41a'

  return (
    <div style={{ padding: '0 16px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <h2 style={{ margin: 0 }}>
                    <DatabaseOutlined /> Gestión de Backups
                  </h2>
                  <span style={{ color: '#666', fontSize: 14 }}>
                    Administra las copias de seguridad de la base de datos
                  </span>
                </Space>
              </Col>
              <Col>
                <Space>
                  <CustomButton
                    type="default"
                    icon={<ClearOutlined />}
                    onClick={handleCleanBackups}
                    loading={isCleaning}
                  >
                    Limpiar Antiguos
                  </CustomButton>
                  <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateBackup}
                    loading={isCreating}
                    size="large"
                  >
                    Crear Backup
                  </CustomButton>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Alertas */}
        {typeof stats.total_backups === 'number' &&
          stats.total_backups === 0 && (
            <Col span={24}>
              <Alert
                message="No hay backups disponibles"
                description="Crea tu primer backup para comenzar a proteger tus datos."
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            </Col>
          )}

        {typeof diskUsagePercentage === 'number' &&
          diskUsagePercentage > 90 && (
            <Col span={24}>
              <Alert
                message="Espacio en disco crítico"
                description="El disco está casi lleno. Considera eliminar backups antiguos o liberar espacio."
                type="error"
                showIcon
              />
            </Col>
          )}

        {/* Estadísticas */}
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Statistic
              title="Total de Backups"
              value={stats.total_backups}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Statistic
              title="Espacio Utilizado"
              value={stats.total_size_formatted}
              prefix={<HddOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <span style={{ color: '#666', fontSize: 14 }}>Último Backup</span>
              <span style={{ fontSize: 20, fontWeight: 500 }}>
                {stats.last_backup_date
                  ? dayjs(stats.last_backup_date).format('DD/MM/YYYY HH:mm')
                  : 'N/A'}
              </span>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <span style={{ color: '#666', fontSize: 14 }}>Uso de Disco</span>
              <Progress
                percent={diskUsagePercentage}
                strokeColor={diskUsageColor}
                status={diskUsagePercentage > 90 ? 'exception' : 'active'}
              />
            </Space>
          </Card>
        </Col>

        {/* Tabla */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <CloudDownloadOutlined />
                <span>Backups Disponibles</span>
              </Space>
            }
          >
            {Array.isArray(backups) && backups.length === 0 ? (
              <Empty
                description="No hay backups disponibles"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <CustomButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateBackup}
                  loading={isCreating}
                >
                  Crear Primer Backup
                </CustomButton>
              </Empty>
            ) : (
              <Table
                columns={columns}
                dataSource={Array.isArray(backups) ? backups : []}
                loading={loadingBackups}
                rowKey="filename"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total: ${total} backups`,
                }}
                scroll={{ x: 1000 }}
              />
            )}
          </Card>
        </Col>

        {/* Información adicional */}
        <Col span={24}>
          <Card
            type="inner"
            title="Información Importante"
            size="small"
            style={{ background: '#f0f5ff' }}
          >
            <Space direction="vertical" size="small">
              <p style={{ margin: 0 }}>
                <strong>📌 Recomendaciones:</strong>
              </p>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>Crea backups regularmente (al menos una vez por semana)</li>
                <li>Mantén al menos 3-5 backups recientes</li>
                {/* <li>Descarga y almacena copias en ubicaciones externas</li> */}
                {/* <li>Verifica periódicamente el espacio en disco disponible</li> */}
                <li>Limpia backups antiguos cuando sea necesario</li>
              </ul>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
