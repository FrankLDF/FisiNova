// src/features/therapy/components/TherapySessionModal.tsx
import { Modal, Form, Steps, Card, Row, Col, Select, InputNumber } from "antd";
import { useState, useEffect } from "react";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomButton } from "../../../components/Button/CustomButton";
import therapyService from "../services/therapy";
import { showNotification } from "../../../utils/showNotification";

const { TextArea } = CustomInput;
const { Option } = Select;

interface TherapySessionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  therapy: any;
}

export const TherapySessionModal = ({
  open,
  onClose,
  onSuccess,
  therapy,
}: TherapySessionModalProps) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [therapyRecord, setTherapyRecord] = useState<any>(null);

  useEffect(() => {
    if (open && therapy) {
      // Resetear o cargar datos existentes
      if (therapy.therapy_record) {
        setTherapyRecord(therapy.therapy_record);
        setCurrentStep(therapy.therapy_record.completed ? 2 : 1);
        form.setFieldsValue({
          initial_patient_state: therapy.therapy_record.initial_patient_state,
          initial_observations: therapy.therapy_record.initial_observations,
          procedure_ids: therapy.therapy_record.procedure_ids,
          procedure_notes: therapy.therapy_record.procedure_notes,
          intensity: therapy.therapy_record.intensity,
        });
      } else {
        setCurrentStep(0);
        form.resetFields();
      }
    }
  }, [open, therapy, form]);

  const handleStartSession = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields([
        "initial_patient_state",
        "initial_observations",
      ]);

      const response = await therapyService.startSession(therapy.id, {
        initial_patient_state: values.initial_patient_state,
        initial_observations: values.initial_observations,
      });

      setTherapyRecord(response.data.therapy_record);
      setCurrentStep(1);

      showNotification({
        type: "success",
        message: "Sesión iniciada",
      });
    } catch (error: any) {
      showNotification({
        type: "error",
        message: "Error al iniciar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields([
        "procedure_ids",
        "procedure_notes",
        "final_patient_state",
        "final_observations",
        "next_session_recommendation",
        "intensity",
      ]);

      await therapyService.completeSession(therapy.id, values);

      showNotification({
        type: "success",
        message: "Sesión completada",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      showNotification({
        type: "error",
        message: "Error al completar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Inicio", description: "Estado inicial" },
    { title: "Procedimientos", description: "Aplicar tratamiento" },
    { title: "Cierre", description: "Estado final" },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={`Sesión de Terapia - ${therapy?.patient?.name || ""}`}
      width={800}
      footer={null}
    >
      <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

      <Form form={form} layout="vertical">
        {/* PASO 0: INICIO */}
        {currentStep === 0 && (
          <Card title="Estado Inicial del Paciente">
            <CustomFormItem
              label="Estado Inicial del Paciente"
              name="initial_patient_state"
              required
            >
              <TextArea
                rows={4}
                placeholder="Describa cómo llega el paciente: dolor, movilidad, estado general..."
              />
            </CustomFormItem>

            <CustomFormItem
              label="Observaciones Iniciales"
              name="initial_observations"
            >
              <TextArea
                rows={3}
                placeholder="Observaciones adicionales, precauciones, etc..."
              />
            </CustomFormItem>

            <CustomButton
              type="primary"
              onClick={handleStartSession}
              loading={loading}
              block
            >
              Iniciar Sesión
            </CustomButton>
          </Card>
        )}

        {/* PASO 1: PROCEDIMIENTOS */}
        {currentStep === 1 && (
          <Card title="Aplicar Tratamiento">
            <CustomFormItem
              label="Procedimientos Aplicados"
              name="procedure_ids"
              tooltip="Seleccione los procedimientos que aplicará en esta sesión"
            >
              <Select
                mode="multiple"
                placeholder="Seleccionar procedimientos..."
                showSearch
                optionFilterProp="children"
              >
                <Option value={1}>Terapia Física</Option>
                <Option value={2}>Masaje Terapéutico</Option>
                <Option value={3}>Electroterapia</Option>
                <Option value={4}>Ultrasonido</Option>
                <Option value={5}>Ejercicios de Fortalecimiento</Option>
                <Option value={6}>Termoterapia</Option>
                <Option value={7}>Crioterapia</Option>
              </Select>
            </CustomFormItem>

            <Row gutter={16}>
              <Col span={24}>
                <CustomFormItem
                  label="Intensidad del Tratamiento"
                  name="intensity"
                >
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
                placeholder="Describa cómo respondió el paciente, ejercicios realizados, etc..."
              />
            </CustomFormItem>

            <CustomButton
              type="primary"
              onClick={() => setCurrentStep(2)}
              block
            >
              Continuar a Cierre
            </CustomButton>
          </Card>
        )}

        {/* PASO 2: CIERRE */}
        {currentStep === 2 && (
          <Card title="Finalizar Sesión">
            <CustomFormItem
              label="Estado Final del Paciente"
              name="final_patient_state"
              required
            >
              <TextArea
                rows={4}
                placeholder="Describa cómo termina el paciente: mejora en dolor, movilidad, estado general..."
              />
            </CustomFormItem>

            <CustomFormItem
              label="Observaciones Finales"
              name="final_observations"
            >
              <TextArea
                rows={3}
                placeholder="Observaciones adicionales sobre la sesión..."
              />
            </CustomFormItem>

            <CustomFormItem
              label="Recomendación para Siguiente Sesión"
              name="next_session_recommendation"
            >
              <TextArea
                rows={3}
                placeholder="Indique qué se debe enfocar en la próxima sesión..."
              />
            </CustomFormItem>

            <Row gutter={16}>
              <Col span={12}>
                <CustomButton onClick={() => setCurrentStep(1)} block>
                  Volver
                </CustomButton>
              </Col>
              <Col span={12}>
                <CustomButton
                  type="primary"
                  onClick={handleCompleteSession}
                  loading={loading}
                  block
                >
                  Completar Sesión
                </CustomButton>
              </Col>
            </Row>
          </Card>
        )}
      </Form>
    </Modal>
  );
};
