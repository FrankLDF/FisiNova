import { Modal, Form, Checkbox, Space, Alert, Descriptions, Tag, Spin } from 'antd'
import { useState, useEffect } from 'react'
import { CustomButton } from '../../../components/Button/CustomButton'
import { FilePdfOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons'
import patientService from '../services/patient'
import { showNotification } from '../../../utils/showNotification'
import { showHandleError } from '../../../utils/handleError'

interface Props {
  open: boolean
  onClose: () => void
  patientId: number
  patientName: string
}

interface PreviewData {
  patient: any
  stats: {
    total_consultations: number
    total_therapies: number
    first_consultation: string | null
    last_consultation: string | null
    total_diagnoses: number
  }
  has_data: boolean
}

export const PrintMedicalHistoryModal = ({ open, onClose, patientId, patientName }: Props) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // ✅ Cargar preview automáticamente al abrir el modal
  useEffect(() => {
    if (open && patientId) {
      loadPreview()
    }
  }, [open, patientId])

  const loadPreview = async () => {
    try {
      setPreviewLoading(true)
      const response = await patientService.previewMedicalHistory(patientId)
      setPreviewData(response.data)
    } catch (error) {
      showHandleError(error)
      setPreviewData(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      // ✅ Validar que haya datos
      if (previewData && !previewData.has_data) {
        showNotification({
          type: 'warning',
          message: 'No hay datos para generar'
        })
        return
      }

      const values = await form.validateFields()
      setLoading(true)

      await patientService.generateMedicalHistory(patientId, {
        include_vital_signs: values.include_vital_signs ?? true,
        include_medical_history: values.include_medical_history ?? true,
        include_prescriptions: values.include_prescriptions ?? true,
        include_therapy_sessions: values.include_therapy_sessions ?? true,
      })

      showNotification({
        type: 'success',
        message: 'Historial médico generado exitosamente'
      })

      handleClose()
    } catch (error) {
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setPreviewData(null)
    onClose()
  }

  return (
    <Modal
      title={`Imprimir Historial Médico - ${patientName}`}
      open={open}
      onCancel={handleClose}
      width={700}
      footer={[
        <CustomButton key="cancel" onClick={handleClose}>
          Cancelar
        </CustomButton>,
        <CustomButton
          key="generate"
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handleGenerate}
          loading={loading}
          disabled={previewLoading || !!(previewData && !previewData.has_data)}
        >
          Generar PDF
        </CustomButton>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* ✅ MOSTRAR PREVIEW DE DATOS */}
        {previewLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>Cargando información del historial...</p>
          </div>
        ) : previewData ? (
          <>
            {/* ✅ ALERTA SI NO HAY DATOS */}
            {!previewData.has_data ? (
              <Alert
                message="Sin información para generar"
                description="Este paciente no tiene consultas médicas ni sesiones de terapia registradas. No se puede generar el historial médico."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            ) : (
              <>
                <Alert
                  message="Resumen del Historial"
                  description="A continuación se muestra un resumen de la información que se incluirá en el documento PDF"
                  type="info"
                  showIcon
                />

                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Total Consultas" span={1}>
                    <Tag color="blue">{previewData.stats.total_consultations}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Terapias" span={1}>
                    <Tag color="green">{previewData.stats.total_therapies}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Diagnósticos" span={1}>
                    <Tag color="orange">{previewData.stats.total_diagnoses}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Primera Consulta" span={1}>
                    {previewData.stats.first_consultation || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Última Consulta" span={2}>
                    {previewData.stats.last_consultation || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>

                {/* OPCIONES DE IMPRESIÓN */}
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    include_vital_signs: true,
                    include_medical_history: true,
                    include_prescriptions: true,
                    include_therapy_sessions: true,
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      Seleccione qué información incluir:
                    </div>

                    <Form.Item
                      name="include_vital_signs"
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Checkbox>
                        <strong>Incluir Signos Vitales</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Presión arterial, frecuencia cardíaca, temperatura, peso, altura, IMC
                        </div>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      name="include_medical_history"
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Checkbox>
                        <strong>Incluir Antecedentes Médicos</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Antecedentes personales, familiares, alergias, medicamentos actuales
                        </div>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      name="include_prescriptions"
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Checkbox>
                        <strong>Incluir Prescripciones</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Medicamentos recetados en cada consulta
                        </div>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      name="include_therapy_sessions"
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>
                        <strong>Incluir Historial de Terapias</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Sesiones de terapia física completadas, observaciones y evolución
                        </div>
                      </Checkbox>
                    </Form.Item>
                  </Space>
                </Form>

                <Alert
                  message="Información del Documento"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12 }}>
                      <li>El documento incluirá todos los datos personales del paciente</li>
                      <li>Se mostrarán todas las consultas médicas con diagnósticos CIE-10</li>
                      <li>Incluye procedimientos realizados y plan de tratamiento</li>
                      <li>El PDF se descargará automáticamente al generarse</li>
                    </ul>
                  }
                  type="warning"
                />
              </>
            )}
          </>
        ) : (
          <Alert
            message="Error al cargar información"
            description="No se pudo obtener la información del historial médico del paciente"
            type="error"
            showIcon
          />
        )}
      </Space>
    </Modal>
  )
}