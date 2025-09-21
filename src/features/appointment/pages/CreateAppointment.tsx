import { Card, Row, Col, Select, DatePicker, TimePicker, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CustomForm } from "../../../components/form/CustomForm";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomInput } from "../../../components/input/CustomInput";
import { CustomButton } from "../../../components/Button/CustomButton";
import { PatientSelectorField } from "../../../components/form/PatientSelectorField"; // 👈 Campo visual
import { PatientSelectorModal } from "../../../components/modals/PatientSelectorModal"; // 👈 Modal
import { useCustomMutation } from "../../../hooks/UseCustomMutation";
import { showNotification } from "../../../utils/showNotification";
import appointmentService from "../services/appointment";
import dayjs from "dayjs";
import { Typography } from "antd";
import type { Patient } from "../../patient/models/patient";

const { Title } = Typography;
const { TextArea } = CustomInput;
const { Option } = Select;

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
}

interface Insurance {
  id: number;
  name: string;
  provider_code?: string;
}

export const CreateAppointment = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingInsurances, setLoadingInsurances] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editInsuranceCode, setEditInsuranceCode] = useState(true);

  const startTime = Form.useWatch('start_time', form);

  useEffect(() => {
    loadEmployees();
    loadInsurances();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await appointmentService.getEmployees();

      const employeeData = response?.data?.data || response?.data || [];
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      showNotification({
        type: "error",
        message: "Error al cargar empleados",
      });
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadInsurances = async () => {
    try {
      setLoadingInsurances(true);
      const response = await appointmentService.getAvaiableInsuranceCompanies();

      const insuranceData = response?.data?.data || response?.data || [];
      setInsurances(Array.isArray(insuranceData) ? insuranceData : []);
    } catch (error) {
      console.error("Error cargando compañías de seguro:", error);
      showNotification({
        type: "error",
        message: "Error al cargar compañías de seguro",
      });
      setInsurances([]);
    } finally {
      setLoadingInsurances(false);
    }
  };

  const { mutate: createAppointment, isPending } = useCustomMutation({
    execute: appointmentService.createAppointment,
    onSuccess: () => {
      showNotification({
        type: "success",
        message: "Cita creada exitosamente",
      });
      navigate("/consult-appointments");
    },
    onError: (err) => {
      console.error("Error creando cita:", err);
      showNotification({
        type: "error",
        message: err.response?.error?.message || "Error al crear la cita",
      });
    },
  });

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);

    if (patient) {
      form.setFieldsValue({
        guest_firstname: patient.firstname,
        guest_lastname: patient.lastname,
        dni: patient.dni,
        phone: patient.phone,
        passport: patient.passport,
        insurance_code: patient.insurance_code,
        insurance_id: patient.insurance?.id,
      });
    } else {
      form.setFieldsValue({
        guest_firstname: undefined,
        guest_lastname: undefined,
        dni: undefined,
        phone: undefined,
        passport: undefined,
        insurance_code: undefined,
        insurance_id: undefined,
      });
    }
  };

  const handleInsuranceChange = (insuranceId: number) => {
    const isDifferentFromPatient =
      selectedPatient?.insurance?.id !== insuranceId;
    setEditInsuranceCode(isDifferentFromPatient);

    if (!isDifferentFromPatient && selectedPatient?.insurance_code) {
      form.setFieldValue("insurance_code", selectedPatient.insurance_code);
    }
  };

  const onFinish = (values: any) => {
    try {
      if (!values.employee_id) {
        showNotification({
          type: "error",
          message: "Debe seleccionar un especialista",
        });
        return;
      }

      if (!values.guest_firstname || !values.guest_lastname) {
        showNotification({
          type: "error",
          message: "Nombre y apellido son requeridos",
        });
        return;
      }
      const appointmentData = {
        ...values,
        patient_id: selectedPatient?.id || null,
        appointment_date: values.appointment_date?.format("YYYY-MM-DD"),
        start_time: values.start_time?.format("HH:mm"),
        end_time: values.end_time?.format("HH:mm"),
        ...(selectedPatient && {
          dni: selectedPatient.dni,
          phone: selectedPatient.phone,
          passport: selectedPatient.passport,
          insurance_code: selectedPatient.insurance_code,
          insurance_id: selectedPatient.insurance?.id,
        }),
      };

      createAppointment(appointmentData);
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error procesando los datos del formulario",
      });
    }
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Card
            title="Crear Nueva Cita"
            extra={
              <CustomButton
                type="default"
                onClick={() => navigate("/consult-appointments")}
              >
                Volver a Consultas
              </CustomButton>
            }
          >
            <CustomForm
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ width: "100%" }}
            >
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "6px",
                  marginBottom: "24px",
                  border: "1px solid #e9ecef",
                }}
              >
                <Title level={5} style={{ margin: "0 0 16px 0" }}>
                  Información del Paciente
                </Title>

                <Row gutter={16}>
                  <Col span={24} style={{ marginBottom: "16px" }}>
                    <PatientSelectorField
                      selectedPatient={selectedPatient}
                      onOpenModal={() => setIsPatientModalOpen(true)}
                      onClear={() => handlePatientSelect(null)}
                      placeholder="Buscar y seleccionar paciente..."
                      allowClear={true}
                    />
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem
                      label="Nombre"
                      name="guest_firstname"
                      required
                    >
                      <CustomInput
                        placeholder="Nombre del paciente"
                        disabled={!!selectedPatient}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem
                      label="Apellido"
                      name="guest_lastname"
                      required
                    >
                      <CustomInput
                        placeholder="Apellido del paciente"
                        disabled={!!selectedPatient}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem label="DNI" name="dni">
                      <CustomInput
                        placeholder="Número de identificación"
                        disabled={!!selectedPatient}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem label="Teléfono" name="phone" required>
                      <CustomInput
                        placeholder="Número de teléfono"
                        disabled={!!selectedPatient}
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem label="Pasaporte" name="passport">
                      <CustomInput
                        placeholder="Número de pasaporte"
                        disabled={!!selectedPatient}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem
                      label="Seguro Médico"
                      name="insurance_id"
                      required
                    >
                      <Select
                        placeholder="Seleccionar seguro..."
                        loading={loadingInsurances}
                        showSearch
                        optionFilterProp="children"
                        onChange={handleInsuranceChange}
                        notFoundContent={
                          loadingInsurances
                            ? "Cargando..."
                            : "No hay seguros médicos"
                        }
                      >
                        {insurances.map((insurance) => (
                          <Option key={insurance.id} value={insurance.id}>
                            {insurance.name}
                          </Option>
                        ))}
                      </Select>
                    </CustomFormItem>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <CustomFormItem
                      label="Código de Seguro"
                      name="insurance_code"
                    >
                      <CustomInput
                        placeholder="Código del seguro médico"
                        disabled={!!selectedPatient && !editInsuranceCode}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </div>

              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "6px",
                  marginBottom: "24px",
                  border: "1px solid #e9ecef",
                }}
              >
                <Title level={5} style={{ margin: "0 0 16px 0" }}>
                  Detalles de la Cita
                </Title>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24} md={12} lg={12}>
                    <CustomFormItem
                      label="Especialista"
                      name="employee_id"
                      required
                    >
                      <Select
                        placeholder="Seleccionar especialista..."
                        loading={loadingEmployees}
                        showSearch
                        optionFilterProp="children"
                        notFoundContent={
                          loadingEmployees
                            ? "Cargando..."
                            : "No hay especialistas"
                        }
                      >
                        {employees.map((employee) => (
                          <Option key={employee.id} value={employee.id}>
                            {`Dr(a). ${employee.firstname || ""} ${
                              employee.lastname || ""
                            }`}
                          </Option>
                        ))}
                      </Select>
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={12}>
                    <CustomFormItem
                      label="Fecha"
                      name="appointment_date"
                      required
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="dd/mm/aaaa"
                        format="DD/MM/YYYY"
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={12} lg={12}>
                    <CustomFormItem
                      label="Hora Inicio"
                      name="start_time"
                      required
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        placeholder="Seleccionar hora..."
                        format="HH:mm"
                      />
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={12}>
                    <CustomFormItem
                      label="Hora Fin"
                      name="end_time"
                      required
                      rules={[
                        {
                          required: true,
                          message: "La hora de fin es requerida",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const startTime = getFieldValue("start_time");
                            if (!value || !startTime) {
                              return Promise.resolve();
                            }
                            if (dayjs(value).isAfter(dayjs(startTime))) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "La hora de fin debe ser mayor que la hora de inicio"
                              )
                            );
                          },
                        }),
                      ]}
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        placeholder="Seleccionar hora..."
                        format="HH:mm"  
                        disabled={!startTime}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <CustomFormItem label="Notas" name="notes">
                      <TextArea
                        rows={4}
                        placeholder="Notas adicionales o comentarios sobre la cita..."
                        style={{
                          resize: "vertical",
                          minHeight: "100px",
                        }}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </div>

              <Row justify="end" gutter={16} style={{ marginTop: "24px" }}>
                <Col xs={24} sm={12} md={6} lg={4}>
                  <CustomButton
                    type="default"
                    onClick={() => navigate("/consult-appointments")}
                    style={{ width: "100%", minHeight: "40px" }}
                  >
                    Cancelar
                  </CustomButton>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <CustomButton
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    style={{ width: "100%", minHeight: "40px" }}
                  >
                    Crear Cita
                  </CustomButton>
                </Col>
              </Row>
            </CustomForm>
          </Card>
        </Col>
      </Row>

      <PatientSelectorModal
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSelect={handlePatientSelect}
        selectedPatientId={selectedPatient?.id}
        title="Seleccionar Paciente para la Cita"
        allowClear={true}
      />
    </div>
  );
};
