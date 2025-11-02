// src/features/therapy/components/TherapySessionModal.tsx
import React from "react";
import {
  Modal,
  Form,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Rate,
  Slider,
  Select,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  UserOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomButton } from "../../../components/Button/CustomButton";

const { Title, Text } = Typography;
const { TextArea } = CustomInput;
const { Option } = Select;

interface TherapySessionModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  therapy: any;
}

export const TherapySessionModal: React.FC<TherapySessionModalProps> = ({
  open,
  onClose,
  onComplete,
  therapy,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log("📝 Datos de sesión:", values);
    onComplete({
      therapy_id: therapy?.id,
      ...values,
    });
    form.resetFields();
  };

  if (!therapy) return null;

  const isCompleted = therapy.status === "completed";

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined style={{ color: "#1890ff" }} />
          <span>
            {isCompleted ? "Detalles de" : "Registrar"} Sesión de Terapia
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Info del paciente */}
        <Card
          size="small"
          style={{ marginBottom: 16, background: "#f6ffed" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Space direction="vertical" size={0}>
                <Text type="secondary">Paciente</Text>
                <Text strong style={{ fontSize: 16 }}>
                  <UserOutlined /> {therapy.patient.name}
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size={0}>
                <Text type="secondary">Sesión</Text>
                <Tag color="blue" style={{ fontSize: 14 }}>
                  {therapy.sessionNumber} de {therapy.totalSessions}
                </Tag>
              </Space>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text type="secondary">Procedimiento: </Text>
              <Text strong>{therapy.procedure}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Autorización: </Text>
              <Text strong>{therapy.authorizationNumber}</Text>
            </Col>
          </Row>
        </Card>

        {!isCompleted && (
          <>
            {/* Evaluación inicial */}
            <Card
              type="inner"
              title="Evaluación Inicial"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <CustomFormItem label="Nivel de Dolor (0-10)" name="pain_level">
                    <Slider
                      min={0}
                      max={10}
                      marks={{
                        0: "Sin dolor",
                        5: "Moderado",
                        10: "Severo",
                      }}
                    />
                  </CustomFormItem>
                </Col>
                <Col span={12}>
                  <CustomFormItem
                    label="Movilidad del Paciente"
                    name="mobility_level"
                  >
                    <Select placeholder="Seleccionar nivel">
                      <Option value="excellent">Excelente</Option>
                      <Option value="good">Buena</Option>
                      <Option value="fair">Regular</Option>
                      <Option value="poor">Limitada</Option>
                    </Select>
                  </CustomFormItem>
                </Col>
              </Row>
            </Card>

            {/* Procedimiento realizado */}
            <Card
              type="inner"
              title="Procedimiento Realizado"
              style={{ marginBottom: 16 }}
            >
              <CustomFormItem
                label="Técnicas Aplicadas"
                name="techniques"
                required
              >
                <Select
                  mode="multiple"
                  placeholder="Seleccionar técnicas..."
                >
                  <Option value="massage">Masaje Terapéutico</Option>
                  <Option value="stretching">Estiramientos</Option>
                  <Option value="exercises">Ejercicios de Fortalecimiento</Option>
                  <Option value="heat_therapy">Termoterapia</Option>
                  <Option value="cold_therapy">Crioterapia</Option>
                  <Option value="electrotherapy">Electroterapia</Option>
                  <Option value="ultrasound">Ultrasonido</Option>
                </Select>
              </CustomFormItem>

              <Row gutter={16}>
                <Col span={12}>
                  <CustomFormItem
                    label="Duración Efectiva (minutos)"
                    name="duration"
                  >
                    <Select placeholder="Duración">
                      <Option value={30}>30 minutos</Option>
                      <Option value={45}>45 minutos</Option>
                      <Option value={60}>60 minutos</Option>
                    </Select>
                  </CustomFormItem>
                </Col>
                <Col span={12}>
                  <CustomFormItem label="Intensidad" name="intensity">
                    <Select placeholder="Seleccionar intensidad">
                      <Option value="low">Baja</Option>
                      <Option value="moderate">Moderada</Option>
                      <Option value="high">Alta</Option>
                    </Select>
                  </CustomFormItem>
                </Col>
              </Row>

              <CustomFormItem
                label="Observaciones del Procedimiento"
                name="procedure_notes"
              >
                <TextArea
                  rows={3}
                  placeholder="Describa cómo respondió el paciente, ejercicios realizados, etc."
                />
              </CustomFormItem>
            </Card>

            {/* Evaluación post-sesión */}
            <Card
              type="inner"
              title="Evaluación Post-Sesión"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <CustomFormItem
                    label="Progreso del Paciente"
                    name="progress"
                  >
                    <Rate
                      character={<SmileOutlined />}
                      style={{ fontSize: 28 }}
                    />
                  </CustomFormItem>
                </Col>
                <Col span={12}>
                  <CustomFormItem
                    label="Nivel de Dolor Post-Sesión"
                    name="post_pain_level"
                  >
                    <Slider
                      min={0}
                      max={10}
                      marks={{
                        0: "Sin dolor",
                        5: "Moderado",
                        10: "Severo",
                      }}
                    />
                  </CustomFormItem>
                </Col>
              </Row>

              <CustomFormItem
                label="Recomendaciones para el Paciente"
                name="recommendations"
              >
                <TextArea
                  rows={2}
                  placeholder="Ejercicios en casa, precauciones, etc."
                />
              </CustomFormItem>
            </Card>

            {/* Próxima sesión */}
            <Card
              type="inner"
              title="Próxima Sesión"
              style={{ marginBottom: 16, background: "#fff7e6" }}
            >
              <CustomFormItem
                label="Indicaciones para la Próxima Sesión"
                name="next_session_notes"
              >
                <TextArea
                  rows={2}
                  placeholder="Áreas a trabajar, objetivos, etc."
                />
              </CustomFormItem>
            </Card>

            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <CustomButton onClick={onClose}>Cancelar</CustomButton>
              <CustomButton
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
              >
                Completar Sesión
              </CustomButton>
            </Space>
          </>
        )}

        {isCompleted && (
          <Card>
            <Text>Esta sesión ya fue completada.</Text>
          </Card>
        )}
      </Form>
    </Modal>
  );
};