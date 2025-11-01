import React from 'react';
import { Modal, Input, Card, Space, Select, Form } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { CustomForm } from '../../../components/form/CustomForm';
import { CustomFormItem } from '../../../components/form/CustomFormItem';
import { CustomButton } from '../../../components/Button/CustomButton';
import consultationService from '../services/consultation'
import type { Appointment } from '../../appointment/models/appointment';

interface ConsultationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data?: any) => void
  appointment: Appointment | null
  insurances: Array<{ id: number; name: string }>
  loading?: boolean
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  open,
  onClose,
  onConfirm,
  appointment,
  insurances,
  loading,
}) => {
     const [form] = Form.useForm()
    const [diagnostics, setDiagnostics] = React.useState<any[]>([])
    const [procedures, setProcedures] = React.useState<any[]>([])
    const [loadingDiagnostics, setLoadingDiagnostics] = React.useState(false)
    const [loadingProcedures, setLoadingProcedures] = React.useState(false)

    const handleSubmit = (values: any) => {
        onConfirm(values)
    }

    const loadDiagnostics = async (search: string) => {
      setLoadingDiagnostics(true)
        try {
            const data = await consultationService.searchDiagnostics(search)
            setDiagnostics(data)
        } catch (error) {
            console.error('Error loading diagnostics:', error)
            setDiagnostics([])
        }
        setLoadingDiagnostics(false)
    }
    const loadProcedures = async (search: string) => {
      setLoadingProcedures(true)
      try {
          const data = await consultationService.searchProcedures(search)
          setProcedures(data)
      } catch (error) {
          console.error('Error loading procedures:', error)
          setProcedures([])
      }
      setLoadingProcedures(false)
  }

  return (
    <Modal
      title="Registro de Consulta"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <CustomForm form={form} layout="vertical" onFinish={handleSubmit}>
        <CustomFormItem name="appointment_id" hidden>
          <Input />
        </CustomFormItem>
        <CustomFormItem name="patient_id" hidden>
          <Input />
          </CustomFormItem>
          <CustomFormItem name="employee_id" hidden>
            <Input />
          </CustomFormItem>

          <Card
            size="small"
            style={{ marginBottom: 16, background: '#f6ffed' }}
          >
            <Space direction="vertical" size={0}>
              <span>
                <strong>Paciente:</strong>{' '}
                {appointment?.patient?.firstname}{' '}
                {appointment?.patient?.lastname}
              </span>
              {appointment?.patient?.dni && (
                <span>
                  <strong>DNI:</strong> {appointment.patient.dni}
                </span>
              )}
            </Space>
          </Card>

          <CustomFormItem
            label="Diagnósticos (CIE10)"
            name="diagnosis_ids"
            required
          >
            <Select
              mode="multiple"
              placeholder="Buscar diagnósticos..."
              showSearch
              filterOption={false}
              onSearch={loadDiagnostics}
              loading={loadingDiagnostics}
              options={diagnostics.map((d: any) => ({
                label: `${d.code} - ${d.description}`,
                value: d.id,
              }))}
            />
          </CustomFormItem>

          <CustomFormItem label="Procedimientos" name="procedure_ids" required>
            <Select
              mode="multiple"
              placeholder="Buscar procedimientos..."
              showSearch
              filterOption={false}
              onSearch={loadProcedures}
              loading={loadingProcedures}
              options={procedures.map((p: any) => ({
                label: `${p.standard || ''} - ${p.description}`,
                value: p.id,
              }))}
            />
          </CustomFormItem>

          <CustomFormItem label="Notas" name="notes">
            <TextArea rows={4} placeholder="Observaciones adicionales..." />
          </CustomFormItem>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <CustomButton onClick={() => setConsultationModalOpen(false)}>
              Cancelar
            </CustomButton>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={isPending}
              icon={<CheckCircleOutlined />}
            >
              Finalizar Consulta
            </CustomButton>
          </Space>
        </CustomForm>
      </Modal> );
    );
  };