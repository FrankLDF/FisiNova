import { Modal, Form, Checkbox, Space, Alert } from 'antd'
import { useState } from 'react'
import { CustomButton } from '../../../components/Button/CustomButton'
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons'
import patientService from '../services/patient'
import { showNotification } from '../../../utils/showNotification'
import { showHandleError } from '../../../utils/handleError'

interface Props {
  open: boolean
  onClose: () => void
  patientId: number
  patientName: string
}

export const PrintMedicalHistoryModal = ({ open, onClose, patientId, patientName }: Props) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  const handleGenerate = async () => {
    try {
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
        message: 'Historial médico generado exitosamente',
      })

      handleClose()
    } catch (error) {
      showHandleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    try {
      setPreviewLoading(true)
      const response = await patientService.previewMedicalHistory(patientId)

      showNotification({
        type: 'info',
        message: 'Vista previa del historial',
      })
    } catch (error) {
      showHandleError(error)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={`Imprimir Historial Médico - ${patientName}`}
      open={open}
      onCancel={handleClose}
      width={600}
      footer={[
        <CustomButton key="cancel" onClick={handleClose}>
          Cancelar
        </CustomButton>,
        <CustomButton
          key="preview"
          icon={<EyeOutlined />}
          onClick={handlePreview}
          loading={previewLoading}
        >
          Vista Previa
        </CustomButton>,
        <CustomButton
          key="generate"
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handleGenerate}
          loading={loading}
        >
          Generar PDF
        </CustomButton>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Opciones de Impresión"
          description="Seleccione qué información desea incluir en el historial médico del paciente"
          type="info"
          showIcon
        />

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
      </Space>
    </Modal>
  )
}
