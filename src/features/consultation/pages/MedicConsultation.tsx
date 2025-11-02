// src/features/consultation/pages/MedicConsultations.tsx
import { Card, Table, Space, Tag, Modal, Form, Select, Input } from 'antd'
import { PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import consultationService from '../services/consultation'
import type { Appointment } from '../../appointment/models/appointment'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { showHandleError } from '../../../utils/handleError'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomForm } from '../../../components/form/CustomForm'

const { TextArea } = Input

export const MedicConsultations = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [consultationModalOpen, setConsultationModalOpen] = useState(false)
  const [form] = Form.useForm()

  const [diagnostics, setDiagnostics] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false)
  const [loadingProcedures, setLoadingProcedures] = useState(false)

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['medic-appointments'],
    queryFn: consultationService.getMyPendingAppointments,
    refetchInterval: 30000,
  })

  const { mutate: startConsultation } = useCustomMutation({
    execute: consultationService.startConsultation,
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Consulta iniciada',
      })
      refetch()
      loadDiagnostics()
      loadProcedures()
      setConsultationModalOpen(true)
    },
    onError: showHandleError,
  })

  const { mutate: createConsultation, isPending } = useCustomMutation({
    execute: consultationService.createConsultation,
    onSuccess: async () => {
      if (selectedAppointment?.id) {
        await consultationService.completeConsultation(selectedAppointment.id)
      }
      showNotification({
        type: 'success',
        message: 'Consulta completada',
      })
      form.resetFields()
      setConsultationModalOpen(false)
      setSelectedAppointment(null)
      refetch()
    },
    onError: showHandleError,
  })

  const loadDiagnostics = async (search?: string) => {
    try {
      setLoadingDiagnostics(true)
      const res = await consultationService.getDiagnostics(search)
      setDiagnostics(res?.data?.data || res?.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingDiagnostics(false)
    }
  }

  const loadProcedures = async (search?: string) => {
    try {
      setLoadingProcedures(true)
      const res = await consultationService.getProcedureStandards(search)
      setProcedures(res?.data?.data || res?.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingProcedures(false)
    }
  }

  const handleStartConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    form.setFieldsValue({
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      employee_id: appointment.employee_id,
    })
    startConsultation(appointment.id!)
  }

  const handleSubmit = (values: any) => {
    if (!selectedAppointment) return

    createConsultation({
      appointment_id: selectedAppointment.id!,
      patient_id: selectedAppointment.patient_id!,
      employee_id: selectedAppointment.employee_id,
      diagnosis_ids: values.diagnosis_ids || [],
      procedure_ids: values.procedure_ids || [],
      notes: values.notes,
    })
  }

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Fecha',
      dataIndex: 'appointment_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hora',
      render: (_, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: 'Paciente',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{`${record.patient?.firstname} ${record.patient?.lastname}`}</span>
          {record.patient?.dni && (
            <span style={{ fontSize: 12 }}>{record.patient.dni}</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Tipo',
      render: (_, record) => (
        <Tag color={record.type === 'therapy' ? 'blue' : 'green'}>
          {record.type === 'therapy' ? 'Terapia' : 'Consulta'}
        </Tag>
      ),
    },
    {
      title: 'Pago',
      render: (_, record) => {
        const colors: Record<string, string> = {
          insurance: 'blue',
          private: 'orange',
          workplace_risk: 'purple',
        }
        const labels: Record<string, string> = {
          insurance: 'Seguro',
          private: 'Privada',
          workplace_risk: 'Riesgo Laboral',
        }
        return (
          <Tag color={colors[record.payment_type || ''] || 'default'}>
            {labels[record.payment_type || ''] || '-'}
          </Tag>
        )
      },
    },
    {
      title: 'Estado',
      render: (_, record) => (
        <Tag color={record.status === 'en_atencion' ? 'processing' : 'success'}>
          {record.status === 'en_atencion' ? 'En Atención' : 'Confirmada'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <CustomButton
          type="primary"
          icon={
            record.status === 'en_atencion' ? (
              <CheckCircleOutlined />
            ) : (
              <PlayCircleOutlined />
            )
          }
          onClick={() => handleStartConsultation(record)}
        >
          {record.status === 'en_atencion' ? 'Continuar' : 'Iniciar'}
        </CustomButton>
      ),
    },
  ]

  const tableData = appointmentsData?.data?.data || appointmentsData?.data || []

  return (
    <div style={{ padding: '0 16px' }}>
      <Card title="Mis Consultas Pendientes">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Registro de Consulta"
        open={consultationModalOpen}
        onCancel={() => setConsultationModalOpen(false)}
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
                {selectedAppointment?.patient?.firstname}{' '}
                {selectedAppointment?.patient?.lastname}
              </span>
              {selectedAppointment?.patient?.dni && (
                <span>
                  <strong>DNI:</strong> {selectedAppointment.patient.dni}
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
      </Modal>
    </div>
  )
}
