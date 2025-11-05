import React, { useState, useEffect } from 'react'
import { Modal, Form, Row, Col, Alert } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { CustomInput } from '../../../components/form/CustomInput'
import { CustomFormItem } from '../../../components/form/CustomFormItem'
import { CustomSelect, Option } from '../../../components/form/CustomSelect'
import { CustomDatePicker } from '../../../components/form/CustomDatePicker'
import { CustomButton } from '../../../components/Button/CustomButton'
import { useCustomMutation } from '../../../hooks/UseCustomMutation'
import { showNotification } from '../../../utils/showNotification'
import { showHandleError } from '../../../utils/handleError'
import patientService from '../../patient/services/patient'
import appointmentService from '../services/appointment'
import type { Patient } from '../../patient/models/patient'
import dayjs, { Dayjs } from 'dayjs'
import type { Appointment } from '../models/appointment'

interface QuickPatientRegisterProps {
  open: boolean
  onClose: () => void
  onSuccess: (patient: Patient) => void
  appointment?: Appointment | null
}

interface Insurance {
  id: number
  name: string
}

export const QuickPatientRegister: React.FC<QuickPatientRegisterProps> = ({
  open,
  onClose,
  onSuccess,
  appointment,
}) => {
  const [form] = Form.useForm()
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [loadingInsurances, setLoadingInsurances] = useState(false)

  useEffect(() => {
    if (open) {
      loadInsurances()
    }
  }, [open])

  useEffect(() => {
    if (appointment && open) {
      form.setFieldsValue({
        firstname: appointment.guest_firstname || '',
        lastname: appointment.guest_lastname || '',
        insurance_id: appointment.insurance_id,
        insurance_code: appointment.insurance_code,
        dni: appointment.dni,
        phone: appointment.phone,
        passport: appointment.passport,
      })
    }
  }, [appointment, open, form])
  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true)
      const response = await appointmentService.getAvaiableInsuranceCompanies()
      const insuranceData = response?.data?.data || response?.data || []
      setInsurances(Array.isArray(insuranceData) ? insuranceData : [])
    } catch (error) {
      console.error('Error cargando seguros:', error)
      showNotification({
        type: 'error',
        message: 'Error al cargar compañías de seguro',
      })
      setInsurances([])
    } finally {
      setLoadingInsurances(false)
    }
  }

  const { mutate: createPatient, isPending } = useCustomMutation({
    execute: async (data: any) => {
      const patientResponse = await patientService.createPatient(data)
      const newPatient = patientResponse?.data || patientResponse

      if (appointment && newPatient.id) {
        if (!appointment?.id) {
          throw new Error('La cita no tiene un ID válido.')
        }

        await appointmentService.updateAppointment(appointment?.id, {
          patient_id: newPatient.id,
        })
      }

      return newPatient
    },
    onSuccess: (patient) => {
      showNotification({
        type: 'success',
        message: 'Paciente registrado exitosamente',
      })
      form.resetFields()
      onSuccess(patient)
    },
    onError: (err) => {
      showHandleError(err)
    },
  })

  const handleSubmit = (values: any) => {
    const patientData = {
      ...values,
      birthdate: values.birthdate ? dayjs(values.birthdate).format('YYYY-MM-DD') : undefined,
    }

    createPatient(patientData)
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <>
          <UserAddOutlined /> Registro Rápido de Paciente
        </>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Alert
        message="Complete la información básica del paciente"
        description="Podrá completar los datos adicionales más adelante en la ficha del paciente"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Datos Personales */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <CustomFormItem label="Nombre" name="firstname" required>
              <CustomInput placeholder="Nombre del paciente" />
            </CustomFormItem>
          </Col>

          <Col xs={24} md={12}>
            <CustomFormItem label="Apellido" name="lastname" required>
              <CustomInput placeholder="Apellido del paciente" />
            </CustomFormItem>
          </Col>
        </Row>

        {/* Identificación */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <CustomFormItem label="DNI/Cédula" name="dni">
              <CustomInput placeholder="Número de identificación" />
            </CustomFormItem>
          </Col>

          <Col xs={24} md={12}>
            <CustomFormItem label="Pasaporte" name="passport">
              <CustomInput placeholder="Número de pasaporte" />
            </CustomFormItem>
          </Col>
        </Row>

        {/* Sexo y Fecha de Nacimiento */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <CustomFormItem label="Sexo" name="sex">
              <CustomSelect placeholder="Seleccionar sexo">
                <Option value="M">Masculino</Option>
                <Option value="F">Femenino</Option>
              </CustomSelect>
            </CustomFormItem>
          </Col>

          <Col xs={24} md={12}>
            <CustomFormItem label="Fecha de Nacimiento" name="birthdate">
              <CustomDatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="dd/mm/aaaa"
                disabledDate={(current: Dayjs | null) =>
                  current ? current > dayjs().endOf('day') : false
                }
              />
            </CustomFormItem>
          </Col>
        </Row>

        {/* Contacto */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <CustomFormItem label="Teléfono" name="phone" required>
              <CustomInput placeholder="Número de teléfono" />
            </CustomFormItem>
          </Col>

          <Col xs={24} md={12}>
            <CustomFormItem label="Celular" name="cellphone">
              <CustomInput placeholder="Número de celular" />
            </CustomFormItem>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <CustomFormItem label="Email" name="email">
              <CustomInput type="email" placeholder="correo@ejemplo.com" />
            </CustomFormItem>
          </Col>

          <Col xs={24} md={12}>
            <CustomFormItem label="Ciudad" name="city">
              <CustomInput placeholder="Ciudad de residencia" />
            </CustomFormItem>
          </Col>
        </Row>

        {/* Dirección */}
        <Row gutter={16}>
          <Col span={24}>
            <CustomFormItem label="Dirección" name="address">
              <CustomInput.TextArea rows={2} placeholder="Dirección completa" />
            </CustomFormItem>
          </Col>
        </Row>

        {/* Seguro Médico */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <CustomFormItem label="Compañía de Seguro" name="insurance_id">
              <CustomSelect
                placeholder="Seleccionar seguro..."
                loading={loadingInsurances}
                showSearch
                optionFilterProp="children"
                allowClear
              >
                {insurances.map((insurance) => (
                  <Option key={insurance.id} value={insurance.id}>
                    {insurance.name}
                  </Option>
                ))}
              </CustomSelect>
            </CustomFormItem>
          </Col>

          <Col xs={24} md={12}>
            <CustomFormItem label="Código de Seguro" name="insurance_code">
              <CustomInput placeholder="Código del seguro médico" />
            </CustomFormItem>
          </Col>
        </Row>

        {/* Botones */}
        <Row justify="end" gutter={16} style={{ marginTop: 24 }}>
          <Col>
            <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
          </Col>
          <Col>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={isPending}
              icon={<UserAddOutlined />}
            >
              Registrar Paciente
            </CustomButton>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
