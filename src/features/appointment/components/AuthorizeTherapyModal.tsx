// src/features/appointment/components/AuthorizeTherapyModal.tsx - VERSIÓN MEJORADA
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
  Descriptions,
  Tag,
  Divider,
  Statistic,
  Collapse,
} from "antd";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  ExperimentOutlined,
  SafetyOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
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
import type { MedicalRecord } from "../../consultation/models/medicalRecords";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

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
  medicalRecord?: MedicalRecord;
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
      if (appointment.patient) {
        setSelectedPatient(appointment.patient as Patient);
      }

      form.setFieldsValue({
        insurance_id:
          appointment.insurance_id || appointment.patient?.insurance_id,
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

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setSessions([]);
    setSelectedPatient(null);
    onClose();
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

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

    for (let i = 0; i < sessionsCount; i++) {
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
        authorization_number: form.getFieldValue("authorization_number"),
        authorization_date: form.getFieldValue("authorization_date")
          ? dayjs(form.getFieldValue("authorization_date")).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        insurance_id: form.getFieldValue("insurance_id"),
        sessions_authorized: form.getFieldValue("sessions_authorized"),
        notes: form.getFieldValue("notes"),
        sessions: sessions.map((session) => ({
          appointment_date: dayjs(session.date).format("YYYY-MM-DD"),
          start_time: dayjs(session.startTime).format("HH:mm"),
          end_time: dayjs(session.endTime).format("HH:mm"),
        })),
      };

      onConfirm(data);
    });
  };

  const sessionColumns: ColumnsType<TherapySession> = [
    {
      title: "#",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Fecha",
      dataIndex: "date",
      render: (date: Dayjs) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Horario",
      render: (_, record) =>
        `${dayjs(record.startTime).format("HH:mm")} - ${dayjs(
          record.endTime
        ).format("HH:mm")}`,
    },
    {
      title: "Estado",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color="blue">
          {status === "pending" ? "Pendiente" : "Confirmada"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      width: 100,
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

  const steps = [
    { title: "Paciente", icon: <UserOutlined /> },
    { title: "Autorización", icon: <FileProtectOutlined /> },
    { title: "Programación", icon: <CalendarOutlined /> },
  ];

  // Función helper para mostrar datos del paciente
  const renderPatientInfo = () => {
    if (!selectedPatient) return null;

    return (
      <Card
        size="small"
        title={
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <Text strong>Información del Paciente</Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Nombre Completo" span={2}>
            <Text strong style={{ fontSize: 16 }}>
              {selectedPatient.firstname} {selectedPatient.lastname}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <IdcardOutlined /> Cédula
              </>
            }
          >
            {selectedPatient.dni || "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item label="Pasaporte">
            {selectedPatient.passport || "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <PhoneOutlined /> Teléfono
              </>
            }
          >
            {selectedPatient.phone || "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item label="Celular">
            {selectedPatient.cellphone || "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <MailOutlined /> Email
              </>
            }
            span={2}
          >
            {selectedPatient.email || "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item label="Fecha Nacimiento">
            {selectedPatient.birthdate
              ? dayjs(selectedPatient.birthdate).format("DD/MM/YYYY")
              : "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item label="Edad">
            {selectedPatient.birthdate
              ? `${dayjs().diff(dayjs(selectedPatient.birthdate), "year")} años`
              : "No calculable"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <EnvironmentOutlined /> Ciudad
              </>
            }
            span={2}
          >
            {selectedPatient.city || "No registrado"}
          </Descriptions.Item>

          <Descriptions.Item label="Dirección" span={2}>
            {selectedPatient.address || "No registrado"}
          </Descriptions.Item>
        </Descriptions>

        {/* Información del Seguro */}
        <Divider orientation="left" style={{ marginTop: 16, marginBottom: 12 }}>
          <SafetyOutlined /> Información del Seguro
        </Divider>

        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Compañía de Seguro" span={2}>
            {appointment?.insurance ? (
              <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                {appointment.insurance.name}
              </Tag>
            ) : (
              <Tag color="red">Sin seguro registrado</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Código de Seguro" span={2}>
            <Text strong style={{ fontSize: 15 }}>
              {appointment?.insurance_code || selectedPatient.insurance_code || "No registrado"}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  // Función helper para mostrar información de la consulta
  const renderConsultationInfo = () => {
    if (!appointment || !medicalRecord) return null;

    return (
      <Card
        size="small"
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: "#52c41a" }} />
            <Text strong>Información de la Consulta Médica</Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Fecha de Consulta">
            {dayjs(appointment.appointment_date).format("DD/MM/YYYY")}
          </Descriptions.Item>

          <Descriptions.Item label="Hora">
            {appointment.start_time} - {appointment.end_time}
          </Descriptions.Item>

          <Descriptions.Item label="Médico Tratante" span={2}>
            <Text strong>
              {appointment.employee?.firstname} {appointment.employee?.lastname}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {/* Signos Vitales */}
        <Divider orientation="left" style={{ marginTop: 16, marginBottom: 12 }}>
          <HeartOutlined /> Signos Vitales Registrados
        </Divider>

        <Row gutter={[16, 16]}>
          {medicalRecord.blood_pressure_systolic && (
            <Col span={8}>
              <Statistic
                title="Presión Arterial"
                value={`${medicalRecord.blood_pressure_systolic}/${medicalRecord.blood_pressure_diastolic}`}
                suffix="mmHg"
                valueStyle={{ fontSize: 18 }}
              />
            </Col>
          )}
          {medicalRecord.heart_rate && (
            <Col span={8}>
              <Statistic
                title="Frecuencia Cardíaca"
                value={medicalRecord.heart_rate}
                suffix="lpm"
                valueStyle={{ fontSize: 18 }}
              />
            </Col>
          )}
          {medicalRecord.temperature && (
            <Col span={8}>
              <Statistic
                title="Temperatura"
                value={medicalRecord.temperature}
                suffix="°C"
                valueStyle={{ fontSize: 18 }}
              />
            </Col>
          )}
          {medicalRecord.weight && (
            <Col span={8}>
              <Statistic
                title="Peso"
                value={medicalRecord.weight}
                suffix="kg"
                valueStyle={{ fontSize: 18 }}
              />
            </Col>
          )}
          {medicalRecord.height && (
            <Col span={8}>
              <Statistic
                title="Altura"
                value={medicalRecord.height}
                suffix="cm"
                valueStyle={{ fontSize: 18 }}
              />
            </Col>
          )}
          {medicalRecord.bmi && (
            <Col span={8}>
              <Statistic
                title="IMC"
                value={medicalRecord.bmi}
                precision={1}
                valueStyle={{ fontSize: 18 }}
              />
            </Col>
          )}
        </Row>

        {/* Motivo de Consulta */}
        {medicalRecord.chief_complaint && (
          <>
            <Divider
              orientation="left"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
              Motivo de Consulta
            </Divider>
            <Alert
              message={medicalRecord.chief_complaint}
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
            />
          </>
        )}

        {/* Enfermedad Actual */}
        {medicalRecord.current_illness && (
          <>
            <Divider
              orientation="left"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
              Historia de la Enfermedad Actual
            </Divider>
            <Paragraph
              style={{
                padding: "8px 12px",
                background: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              {medicalRecord.current_illness}
            </Paragraph>
          </>
        )}

        {/* Diagnósticos */}
        {medicalRecord.diagnosis_ids &&
          medicalRecord.diagnosis_ids.length > 0 && (
            <>
              <Divider
                orientation="left"
                style={{ marginTop: 16, marginBottom: 12 }}
              >
                <ExperimentOutlined /> Diagnósticos
              </Divider>
              <Space wrap>
                {medicalRecord.diagnostics?.map((dx: any) => (
                  <Tag
                    key={dx.id}
                    color="red"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                  >
                    {dx.code} - {dx.description}
                  </Tag>
                ))}
              </Space>
              {medicalRecord.diagnosis_notes && (
                <Paragraph
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#fff1f0",
                    borderRadius: 4,
                  }}
                >
                  <Text strong>Notas: </Text>
                  {medicalRecord.diagnosis_notes}
                </Paragraph>
              )}
            </>
          )}

        {/* Procedimientos Realizados */}
        {medicalRecord.procedure_ids &&
          medicalRecord.procedure_ids.length > 0 && (
            <>
              <Divider
                orientation="left"
                style={{ marginTop: 16, marginBottom: 12 }}
              >
                Procedimientos Realizados
              </Divider>
              <Space wrap>
                {medicalRecord.procedures?.map((proc: any) => (
                  <Tag
                    key={proc.id}
                    color="blue"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                  >
                    {proc.description}
                  </Tag>
                ))}
              </Space>
            </>
          )}

        {/* Justificación para Terapias */}
        {medicalRecord.therapy_reason && (
          <>
            <Divider
              orientation="left"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
              <InfoCircleOutlined /> Justificación Médica para Terapias
            </Divider>
            <Alert
              message="Indicación de Terapia"
              description={medicalRecord.therapy_reason}
              type="warning"
              showIcon
              icon={<MedicineBoxOutlined />}
            />
          </>
        )}

        {/* Plan de Tratamiento */}
        {medicalRecord.treatment_plan && (
          <>
            <Divider
              orientation="left"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
              Plan de Tratamiento
            </Divider>
            <Paragraph
              style={{
                padding: "8px 12px",
                background: "#f6ffed",
                borderRadius: 4,
              }}
            >
              {medicalRecord.treatment_plan}
            </Paragraph>
          </>
        )}

        {/* Prescripciones */}
        {medicalRecord.prescriptions && (
          <>
            <Divider
              orientation="left"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
              Prescripciones
            </Divider>
            <Paragraph
              style={{
                padding: "8px 12px",
                background: "#e6f7ff",
                borderRadius: 4,
              }}
            >
              {medicalRecord.prescriptions}
            </Paragraph>
          </>
        )}

        {/* Recomendaciones */}
        {medicalRecord.recommendations && (
          <>
            <Divider
              orientation="left"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
              Recomendaciones
            </Divider>
            <Paragraph
              style={{
                padding: "8px 12px",
                background: "#fff7e6",
                borderRadius: 4,
              }}
            >
              {medicalRecord.recommendations}
            </Paragraph>
          </>
        )}

        {/* Antecedentes Médicos (Colapsable para no ocupar mucho espacio) */}
        <Collapse style={{ marginTop: 16 }} ghost>
          <Panel header="Ver Antecedentes Médicos" key="1">
            <Descriptions column={1} size="small" bordered>
              {medicalRecord.has_diabetes && (
                <Descriptions.Item label="Diabetes">
                  <Tag color="red">Sí</Tag>
                </Descriptions.Item>
              )}
              {medicalRecord.has_hypertension && (
                <Descriptions.Item label="Hipertensión">
                  <Tag color="red">Sí</Tag>
                </Descriptions.Item>
              )}
              {medicalRecord.has_asthma && (
                <Descriptions.Item label="Asma">
                  <Tag color="red">Sí</Tag>
                </Descriptions.Item>
              )}
              {medicalRecord.smokes && (
                <Descriptions.Item label="Fumador">
                  <Tag color="orange">
                    Sí - {medicalRecord.smoking_frequency}
                  </Tag>
                </Descriptions.Item>
              )}
              {medicalRecord.drinks_alcohol && (
                <Descriptions.Item label="Consume Alcohol">
                  <Tag color="orange">
                    Sí - {medicalRecord.alcohol_frequency}
                  </Tag>
                </Descriptions.Item>
              )}
              {medicalRecord.allergies && (
                <Descriptions.Item label="Alergias">
                  <Text type="danger">{medicalRecord.allergies}</Text>
                </Descriptions.Item>
              )}
              {medicalRecord.current_medications && (
                <Descriptions.Item label="Medicamentos Actuales">
                  {medicalRecord.current_medications}
                </Descriptions.Item>
              )}
              {medicalRecord.previous_surgeries && (
                <Descriptions.Item label="Cirugías Previas">
                  {medicalRecord.previous_surgeries}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Panel>
        </Collapse>
      </Card>
    );
  };

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
        width={1200}
        footer={null}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 24 }}
        />

        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              authorization_date: dayjs(),
              sessions_authorized: medicalRecord?.therapy_sessions_needed || 10,
              start_date: dayjs().add(1, "day"),
            }}
          >
            {/* PASO 1: INFORMACIÓN DEL PACIENTE Y CONSULTA */}
            {currentStep === 0 && (
              <>
                {selectedPatient ? (
                  <>
                    {renderPatientInfo()}
                    {renderConsultationInfo()}
                  </>
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
                      size="large"
                    >
                      Seleccionar Paciente
                    </CustomButton>
                  </>
                )}
              </>
            )}

            {/* PASO 2: DATOS DE AUTORIZACIÓN */}
            {currentStep === 1 && (
              <>
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#e6f7ff",
                    borderColor: "#91d5ff",
                    marginBottom: 16,
                  }}
                >
                  <Title level={5} style={{ marginTop: 0 }}>
                    <FileProtectOutlined /> Datos de Autorización del Seguro
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

                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <Row gutter={16} align="bottom">
                      <Col span={8}>
                        <CustomFormItem
                          label="Fecha de Inicio"
                          name="start_date"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            placeholder="Fecha inicio"
                            disabledDate={(current) =>
                              current && current < dayjs().startOf("day")
                            }
                          />
                        </CustomFormItem>
                      </Col>
                      <Col span={16}>
                        <CustomButton
                          icon={<CalendarOutlined />}
                          onClick={generateAutomaticSessions}
                          type="dashed"
                          block
                        >
                          Generar Sesiones Automáticamente (Lun-Vie, 9:00 AM)
                        </CustomButton>
                      </Col>
                    </Row>

                    <Divider>O Agregar Sesión Manual</Divider>

                    <Row gutter={16} align="bottom">
                      <Col span={8}>
                        <Text strong>Fecha:</Text>
                        <DatePicker
                          value={sessionDate}
                          onChange={setSessionDate}
                          style={{ width: "100%", marginTop: 8 }}
                          format="DD/MM/YYYY"
                          placeholder="Seleccionar fecha"
                          disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                          }
                        />
                      </Col>
                      <Col span={6}>
                        <Text strong>Hora Inicio:</Text>
                        <TimePicker
                          value={sessionStartTime}
                          onChange={setSessionStartTime}
                          format="HH:mm"
                          style={{ width: "100%", marginTop: 8 }}
                          placeholder="Inicio"
                          minuteStep={15}
                        />
                      </Col>
                      <Col span={6}>
                        <Text strong>Hora Fin:</Text>
                        <TimePicker
                          value={sessionEndTime}
                          onChange={setSessionEndTime}
                          format="HH:mm"
                          style={{ width: "100%", marginTop: 8 }}
                          placeholder="Fin"
                          minuteStep={15}
                        />
                      </Col>
                      <Col span={4}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={addSession}
                          block
                          disabled={
                            !sessionDate || !sessionStartTime || !sessionEndTime
                          }
                        >
                          Agregar
                        </Button>
                      </Col>
                    </Row>
                  </Space>
                </Card>

                <Table
                  columns={sessionColumns}
                  dataSource={sessions}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: "No hay sesiones programadas" }}
                  scroll={{ y: 300 }}
                />
              </>
            )}
          </Form>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            {currentStep > 0 && (
              <CustomButton onClick={prevStep}>Anterior</CustomButton>
            )}
            <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
          </Space>

          <Space>
            {currentStep < 2 ? (
              <CustomButton
                type="primary"
                onClick={nextStep}
                disabled={currentStep === 0 && !selectedPatient}
              >
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
