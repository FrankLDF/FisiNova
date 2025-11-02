// src/features/appointment/components/AuthorizeTherapyModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Space,
  Card,
  Typography,
  Alert,
  DatePicker,
  InputNumber,
} from "antd";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomSelect, Option } from "../../../components/form/CustomSelect";
import { CustomButton } from "../../../components/Button/CustomButton";
import type { Appointment } from "../models/appointment";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface AuthorizeTherapyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  appointment: Appointment | null;
  insurances: Array<{ id: number; name: string }>;
  loading?: boolean;
  medicalRecord?: any;
}

export const AuthorizeTherapyModal: React.FC<AuthorizeTherapyModalProps> = ({
  open,
  onClose,
  onConfirm,
  appointment,
  insurances,
  loading,
  medicalRecord,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (appointment && open) {
      form.setFieldsValue({
        insurance_id: appointment.insurance_id,
        authorization_date: dayjs(),
        sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
        start_date: dayjs().add(1, "day"),
      });
    }
  }, [appointment, open, form, medicalRecord]);

  const handleSubmit = (values: any) => {
    const data = {
      authorization_number: values.authorization_number,
      authorization_date: values.authorization_date
        ? values.authorization_date.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      insurance_id: values.insurance_id,
      sessions_authorized: values.sessions_authorized,
      start_date: values.start_date
        ? values.start_date.format("YYYY-MM-DD")
        : dayjs().add(1, "day").format("YYYY-MM-DD"),
      notes: values.notes,
    };

    onConfirm(data);
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  if (!appointment) return null;

  return (
    <Modal
      title={
        <Space>
          <FileProtectOutlined style={{ color: "#1890ff" }} />
          <span>Autorizar Terapias</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      width={700}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          authorization_date: dayjs(),
          sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
          start_date: dayjs().add(1, "day"),
        }}
      >
        <Card size="small" style={{ marginBottom: 16, background: "#f6ffed" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Title level={5} style={{ margin: 0 }}>
              <CalendarOutlined /> Información de la Consulta
            </Title>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Paciente:</Text>{" "}
                <Text strong>
                  {appointment.patient?.firstname}{" "}
                  {appointment.patient?.lastname}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">DNI:</Text>{" "}
                <Text strong>{appointment.patient?.dni || "N/A"}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Fecha Consulta:</Text>{" "}
                <Text strong>
                  {dayjs(appointment.appointment_date).format("DD/MM/YYYY")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Médico:</Text>{" "}
                <Text strong>
                  {appointment.employee?.firstname}{" "}
                  {appointment.employee?.lastname}
                </Text>
              </Col>
            </Row>
          </Space>
        </Card>

        {medicalRecord?.therapy_reason && (
          <Alert
            message="Justificación Médica"
            description={medicalRecord.therapy_reason}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Card
          size="small"
          style={{
            backgroundColor: "#e6f7ff",
            borderColor: "#91d5ff",
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ marginTop: 0 }}>
            <FileProtectOutlined /> Datos de Autorización
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <CustomFormItem
                label="Número de Autorización"
                name="authorization_number"
                required
              >
                <CustomInput placeholder="Ej: AUTH-2025-001" />
              </CustomFormItem>
            </Col>

            <Col span={12}>
              <CustomFormItem
                label="Fecha de Autorización"
                name="authorization_date"
                required
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                />
              </CustomFormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <CustomFormItem
                label="Compañía de Seguro"
                name="insurance_id"
                required
              >
                <CustomSelect
                  placeholder="Seleccionar seguro..."
                  showSearch
                  optionFilterProp="children"
                >
                  {insurances.map((insurance) => (
                    <Option key={insurance.id} value={insurance.id}>
                      {insurance.name}
                    </Option>
                  ))}
                </CustomSelect>
              </CustomFormItem>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          style={{
            backgroundColor: "#fff7e6",
            borderColor: "#ffd591",
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ marginTop: 0 }}>
            <CalendarOutlined /> Programación de Terapias
          </Title>

          {medicalRecord?.therapy_sessions_needed && (
            <Alert
              message={`El médico recomendó ${medicalRecord.therapy_sessions_needed} sesiones`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={16}>
            <Col span={12}>
              <CustomFormItem
                label="Sesiones Autorizadas"
                name="sessions_authorized"
                required
              >
                <InputNumber
                  min={1}
                  max={50}
                  placeholder="Número de sesiones"
                  style={{ width: "100%" }}
                />
              </CustomFormItem>
            </Col>

            <Col span={12}>
              <CustomFormItem
                label="Fecha de Inicio"
                name="start_date"
                required
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Primera sesión"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </CustomFormItem>
            </Col>
          </Row>

          <Alert
            message="Las citas se generarán automáticamente"
            description="Se crearán citas consecutivas (días laborables) a partir de la fecha de inicio seleccionada"
            type="success"
            showIcon
          />
        </Card>

        <CustomFormItem label="Notas Adicionales" name="notes">
          <CustomInput.TextArea
            rows={3}
            placeholder="Observaciones sobre la autorización..."
          />
        </CustomFormItem>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
          <CustomButton
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            Autorizar y Generar Citas
          </CustomButton>
        </Space>
      </Form>
    </Modal>
  );
};
