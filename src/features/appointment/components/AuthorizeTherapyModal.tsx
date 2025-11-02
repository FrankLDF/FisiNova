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
  Steps,
  Table,
  TimePicker,
  Button,
  Select,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomSelect, Option } from "../../../components/form/CustomSelect";
import { CustomButton } from "../../../components/Button/CustomButton";
import { PatientSelectorModal } from "../../../components/modals/PatientSelectorModal";
import type { Appointment } from "../models/appointment";
import type { Patient } from "../../patient/models/patient";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface TherapySession {
  id: string;
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
  status: "pending" | "confirmed";
  notes?: string;
}

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
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [sessionDate, setSessionDate] = useState<Dayjs | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Dayjs | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (appointment && open) {
      // Configurar paciente inicial
      if (appointment.patient) {
        setSelectedPatient(appointment.patient as Patient);
      }

      form.setFieldsValue({
        insurance_id: appointment.insurance_id,
        authorization_date: dayjs(),
        sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
      });
    }
  }, [appointment, open, form, medicalRecord]);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setSessions([]);
      setSelectedPatient(null);
      setSessionDate(null);
      setSessionStartTime(null);
      setSessionEndTime(null);
      form.resetFields();
    }
  }, [open, form]);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addSession = () => {
    if (!sessionDate || !sessionStartTime || !sessionEndTime) {
      return;
    }

    const newSession: TherapySession = {
      id: generateSessionId(),
      date: sessionDate,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      status: "pending",
    };

    setSessions([...sessions, newSession]);
    setSessionDate(null);
    setSessionStartTime(null);
    setSessionEndTime(null);
  };

  const removeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const generateAutomaticSessions = () => {
    const sessionsCount = form.getFieldValue("sessions_authorized") || 10;
    const startDate = form.getFieldValue("start_date") || dayjs().add(1, "day");

    const newSessions: TherapySession[] = [];
    let currentDate = startDate;

    // Configuración predeterminada: Lunes a Viernes, 9:00 AM - 10:00 AM
    for (let i = 0; i < sessionsCount; i++) {
      // Saltar fines de semana
      while (currentDate.day() === 0 || currentDate.day() === 6) {
        currentDate = currentDate.add(1, "day");
      }

      newSessions.push({
        id: generateSessionId(),
        date: currentDate,
        startTime: dayjs().hour(9).minute(0),
        endTime: dayjs().hour(10).minute(0),
        status: "pending",
      });

      currentDate = currentDate.add(1, "day");
    }

    setSessions(newSessions);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!selectedPatient) {
        Modal.error({
          title: "Error",
          content: "Debe seleccionar un paciente",
        });
        return;
      }

      if (sessions.length === 0) {
        Modal.error({
          title: "Error",
          content: "Debe programar al menos una sesión de terapia",
        });
        return;
      }

      const data = {
        patient_id: selectedPatient.id,
        authorization_number: values.authorization_number,
        authorization_date: values.authorization_date
          ? values.authorization_date.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        insurance_id: values.insurance_id,
        sessions_authorized: values.sessions_authorized,
        notes: values.notes,
        sessions: sessions.map((session) => ({
          date: session.date.format("YYYY-MM-DD"),
          start_time: session.startTime.format("HH:mm"),
          end_time: session.endTime.format("HH:mm"),
        })),
      };

      console.log("📤 Datos a enviar:", data);
      onConfirm(data);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setSessions([]);
    setSelectedPatient(null);
    onClose();
  };

  const nextStep = () => {
    if (currentStep === 0 && !selectedPatient) {
      Modal.warning({
        title: "Paciente Requerido",
        content: "Debe seleccionar un paciente antes de continuar",
      });
      return;
    }

    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(() => {
        Modal.warning({
          title: "Campos Requeridos",
          content: "Complete todos los campos requeridos antes de continuar",
        });
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const sessionColumns: ColumnsType<TherapySession> = [
    {
      title: "Fecha",
      key: "date",
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <Text>{record.date.format("DD/MM/YYYY")}</Text>
          <Tag color="blue">{record.date.format("dddd")}</Tag>
        </Space>
      ),
    },
    {
      title: "Horario",
      key: "time",
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <Text>
            {record.startTime.format("HH:mm")} - {record.endTime.format("HH:mm")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Duración",
      key: "duration",
      render: (_, record) => {
        const duration = record.endTime.diff(record.startTime, "minutes");
        return <Tag>{duration} minutos</Tag>;
      },
    },
    {
      title: "Estado",
      key: "status",
      render: (_, record) => (
        <Tag color="orange">Pendiente</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeSession(record.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  if (!appointment) return null;

  const steps = [
    { title: "Paciente", icon: <UserOutlined /> },
    { title: "Autorización", icon: <FileProtectOutlined /> },
    { title: "Programación", icon: <CalendarOutlined /> },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <FileProtectOutlined style={{ color: "#1890ff" }} />
            <span>Autorizar Terapias y Programar Sesiones</span>
          </Space>
        }
        open={open}
        onCancel={handleCancel}
        width={1000}
        footer={null}
        destroyOnClose
      >
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            authorization_date: dayjs(),
            sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
            start_date: dayjs().add(1, "day"),
          }}
        >
          {/* PASO 1: SELECCIONAR PACIENTE */}
          {currentStep === 0 && (
            <Card
              size="small"
              style={{
                backgroundColor: "#e6f7ff",
                borderColor: "#91d5ff",
                marginBottom: 16,
              }}
            >
              <Title level={5} style={{ marginTop: 0 }}>
                <UserOutlined /> Paso 1: Seleccionar Paciente
              </Title>

              {selectedPatient ? (
                <Card
                  size="small"
                  style={{
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 16 }}>
                          {selectedPatient.firstname} {selectedPatient.lastname}
                        </Text>
                        <Space>
                          {selectedPatient.dni && (
                            <Text type="secondary">DNI: {selectedPatient.dni}</Text>
                          )}
                          {selectedPatient.phone && (
                            <Text type="secondary">
                              Tel: {selectedPatient.phone}
                            </Text>
                          )}
                        </Space>
                      </Space>
                    </Col>
                    <Col>
                      <CustomButton
                        size="small"
                        onClick={() => setShowPatientModal(true)}
                      >
                        Cambiar Paciente
                      </CustomButton>
                    </Col>
                  </Row>
                </Card>
              ) : (
                <>
                  <Alert
                    message="Paciente Requerido"
                    description="Debe seleccionar un paciente para autorizar las terapias"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <CustomButton
                    type="primary"
                    icon={<UserOutlined />}
                    onClick={() => setShowPatientModal(true)}
                    block
                  >
                    Seleccionar Paciente
                  </CustomButton>
                </>
              )}

              <Card
                size="small"
                style={{
                  marginTop: 16,
                  background: "#f6ffed",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  <CalendarOutlined /> Información de la Consulta
                </Title>
                <Row gutter={16} style={{ marginTop: 8 }}>
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
              </Card>
            </Card>
          )}

          {/* PASO 2: DATOS DE AUTORIZACIÓN */}
          {currentStep === 1 && (
            <>
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
                </Row>
              </Card>

              <CustomFormItem label="Notas Adicionales" name="notes">
                <CustomInput.TextArea
                  rows={3}
                  placeholder="Observaciones sobre la autorización..."
                />
              </CustomFormItem>
            </>
          )}

          {/* PASO 3: PROGRAMAR SESIONES */}
          {currentStep === 2 && (
            <>
              <Alert
                message="Programación de Sesiones"
                description="Programe las fechas y horarios específicos para cada sesión de terapia. Puede generar sesiones automáticamente o agregarlas manualmente."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {/* Generación automática */}
              <Card
                size="small"
                style={{ marginBottom: 16, background: "#fff7e6" }}
              >
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space direction="vertical" size={0}>
                      <Text strong>Generación Automática</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Genera sesiones consecutivas de Lunes a Viernes, 9:00 AM
                        - 10:00 AM
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <CustomButton
                      icon={<PlusOutlined />}
                      onClick={generateAutomaticSessions}
                      disabled={sessions.length > 0}
                    >
                      Generar Automáticamente
                    </CustomButton>
                  </Col>
                </Row>
              </Card>

              {/* Agregar sesión manual */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <Title level={5} style={{ marginTop: 0 }}>
                  <PlusOutlined /> Agregar Sesión Manualmente
                </Title>

                <Row gutter={16}>
                  <Col span={8}>
                    <label>Fecha</label>
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Seleccionar fecha"
                      value={sessionDate}
                      onChange={setSessionDate}
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Col>

                  <Col span={6}>
                    <label>Hora Inicio</label>
                    <TimePicker
                      style={{ width: "100%" }}
                      format="HH:mm"
                      placeholder="HH:mm"
                      value={sessionStartTime}
                      onChange={setSessionStartTime}
                      minuteStep={15}
                    />
                  </Col>

                  <Col span={6}>
                    <label>Hora Fin</label>
                    <TimePicker
                      style={{ width: "100%" }}
                      format="HH:mm"
                      placeholder="HH:mm"
                      value={sessionEndTime}
                      onChange={setSessionEndTime}
                      minuteStep={15}
                      disabledTime={() => ({
                        disabledHours: () =>
                          sessionStartTime
                            ? Array.from({ length: sessionStartTime.hour() }, (_, i) => i)
                            : [],
                      })}
                    />
                  </Col>

                  <Col span={4} style={{ display: "flex", alignItems: "flex-end" }}>
                    <CustomButton
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addSession}
                      disabled={!sessionDate || !sessionStartTime || !sessionEndTime}
                      block
                    >
                      Agregar
                    </CustomButton>
                  </Col>
                </Row>
              </Card>

              {/* Tabla de sesiones */}
              <Card size="small">
                <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
                  <Col>
                    <Title level={5} style={{ margin: 0 }}>
                      Sesiones Programadas ({sessions.length})
                    </Title>
                  </Col>
                  {sessions.length > 0 && (
                    <Col>
                      <CustomButton
                        danger
                        size="small"
                        onClick={() => setSessions([])}
                      >
                        Limpiar Todo
                      </CustomButton>
                    </Col>
                  )}
                </Row>

                <Table
                  columns={sessionColumns}
                  dataSource={sessions}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  locale={{
                    emptyText: "No hay sesiones programadas. Agregue al menos una sesión.",
                  }}
                  scroll={{ y: 300 }}
                />
              </Card>
            </>
          )}

          {/* Botones de navegación */}
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginTop: 24,
            }}
          >
            <Space>
              {currentStep > 0 && (
                <CustomButton onClick={prevStep}>Anterior</CustomButton>
              )}
              <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
            </Space>

            <Space>
              {currentStep < steps.length - 1 ? (
                <CustomButton type="primary" onClick={nextStep}>
                  Siguiente
                </CustomButton>
              ) : (
                <CustomButton
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={sessions.length === 0}
                >
                  Autorizar y Crear {sessions.length} Citas
                </CustomButton>
              )}
            </Space>
          </Space>
        </Form>
      </Modal>

      <PatientSelectorModal
        open={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelect={(patient) => {
          setSelectedPatient(patient);
          setShowPatientModal(false);
        }}
        selectedPatientId={selectedPatient?.id}
        title="Seleccionar Paciente para las Terapias"
        allowClear={false}
      />
    </>
  );
};