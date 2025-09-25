import { Card, Row, Col, Form, Grid, Skeleton } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomForm } from "../../../components/form/CustomForm";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomInput } from "../../../components/input/CustomInput";
import { CustomSelect, Option } from "../../../components/form/CustomSelect";
import {
  CustomDatePicker,
  CustomTimePicker,
} from "../../../components/form/CustomDatePicker";
import { CustomButton } from "../../../components/Button/CustomButton";
import { PatientSelectorField } from "../../../components/form/PatientSelectorField";
import { PatientSelectorModal } from "../../../components/modals/PatientSelectorModal";
import { useCustomMutation } from "../../../hooks/UseCustomMutation";
import { showNotification } from "../../../utils/showNotification";
import appointmentService from "../services/appointment";
import dayjs, { Dayjs } from "dayjs";
import { Typography } from "antd";
import type { Patient } from "../../patient/models/patient";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { showHandleError } from "../../../utils/handleError";

const { Title } = Typography;

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

type FormMode = "create" | "edit" | "view";

export const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingInsurances, setLoadingInsurances] = useState(false);
  const isSmallDevice = Grid.useBreakpoint()?.xs || false;

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editInsuranceCode, setEditInsuranceCode] = useState(true);
  const [mode, setMode] = useState<FormMode>("create");
  const [isEditing, setIsEditing] = useState(false);

  const startTime = Form.useWatch("start_time", form);

  useEffect(() => {
    const currentPath = window.location.pathname;

    if (id) {
      if (currentPath.includes("/edit") || currentPath.includes("/form")) {
        setMode("edit");
        setIsEditing(true);
      } else {
        setMode("view");
        setIsEditing(false);
      }
    } else {
      setMode("create");
      setIsEditing(true);
    }
  }, [id]);

  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentService.getAppointment(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    loadEmployees();
    loadInsurances();
  }, []);

  useEffect(() => {
    if (appointmentData?.data && id) {
      const appointment = appointmentData.data;

      if (appointment.patient) {
        setSelectedPatient(appointment.patient);
      }

      form.setFieldsValue({
        employee_id: appointment.employee_id,
        appointment_date: appointment.appointment_date
          ? dayjs(appointment.appointment_date)
          : null,
        start_time: appointment.start_time
          ? dayjs(appointment.start_time, "HH:mm")
          : null,
        end_time: appointment.end_time
          ? dayjs(appointment.end_time, "HH:mm")
          : null,
        status: appointment.status || "programada",
        notes: appointment.notes,
        guest_firstname:
          appointment.guest_firstname || appointment.patient?.firstname,
        guest_lastname:
          appointment.guest_lastname || appointment.patient?.lastname,
        dni: appointment.dni || appointment.patient?.dni,
        phone: appointment.phone || appointment.patient?.phone,
        passport: appointment.passport || appointment.patient?.passport,
        insurance_code:
          appointment.insurance_code || appointment.patient?.insurance_code,
        insurance_id:
          appointment.insurance_id || appointment.patient?.insurance?.id,
      });

      setEditInsuranceCode(!appointment.patient?.insurance_code);
    }
  }, [appointmentData, form, id]);

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

  const { mutate: createAppointment, isPending: isCreating } =
    useCustomMutation({
      execute: appointmentService.createAppointment,
      onSuccess: () => {
        showNotification({
          type: "success",
          message: "Cita creada exitosamente",
        });
        navigate("/consult-appointments");
      },
      onError: (err) => {
        showHandleError(err);
      },
    });

  const { mutate: updateAppointment, isPending: isUpdating } =
    useCustomMutation({
      execute: ({ id, data }: { id: number; data: any }) =>
        appointmentService.updateAppointment(id, data),
      onSuccess: () => {
        showNotification({
          type: "success",
          message: "Cita actualizada exitosamente",
        });
        navigate("/consult-appointments");
      },
      onError: (err) => {
        showHandleError(err);
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

      if (mode === "create") {
        createAppointment(appointmentData);
      } else if (mode === "edit" && id) {
        updateAppointment({ id: Number(id), data: appointmentData });
      }
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error procesando los datos del formulario",
      });
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Crear Cita";
      case "edit":
        return "Editar Cita";
      case "view":
        return "Detalles de la Cita";
      default:
        return "Cita";
    }
  };

  const getSubmitButtonText = () => {
    if (mode === "create") return "Crear Cita";
    if (mode === "edit") return "Actualizar Cita";
    return "";
  };

  const isPending = isCreating || isUpdating;
  const isViewMode = mode === "view" && !isEditing;

  if (loadingAppointment && id) {
    return (
      <div style={{ padding: "0 16px" }}>
        <Card>
          <Skeleton active />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Card
            title={getTitle()}
            extra={
              <Row gutter={8}>
                {mode === "view" && (
                  <Col>
                    <CustomButton
                      type={isEditing ? "default" : "primary"}
                      icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
                      onClick={toggleEditMode}
                    >
                      {isSmallDevice
                        ? null
                        : isEditing
                        ? "Cancelar Edición"
                        : "Editar"}
                    </CustomButton>
                  </Col>
                )}
                <Col>
                  <CustomButton
                    type="default"
                    onClick={() => navigate("/consult-appointments")}
                  >
                    {isSmallDevice ? (
                      <ArrowLeftOutlined />
                    ) : (
                      "Volver a Consultas"
                    )}
                  </CustomButton>
                </Col>
              </Row>
            }
          >
            <CustomForm
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ width: "100%" }}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "6px",
                      marginBottom: "24px",
                      border: "1px solid #e9ecef",
                      height: "fit-content",
                    }}
                  >
                    <Title level={5} style={{ margin: "0 0 16px 0" }}>
                      Información del Paciente
                    </Title>

                    <Row gutter={[16, 16]}>
                      <Col
                        span={24}
                        style={{
                          textAlign: isSmallDevice ? "center" : "right",
                          marginBottom: isSmallDevice ? 8 : 0,
                        }}
                      >
                        <PatientSelectorField
                          selectedPatient={selectedPatient}
                          onOpenModal={() => setIsPatientModalOpen(true)}
                          onClear={() => handlePatientSelect(null)}
                          placeholder="Buscar Paciente"
                          allowClear={true}
                          height={40}
                          width={200}
                          showInfo={false}
                          disabled={isViewMode}
                        />
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem
                          label="Nombre"
                          name="guest_firstname"
                          required
                        >
                          <CustomInput
                            placeholder="Nombre del paciente"
                            readOnly={!!selectedPatient || isViewMode}
                          />
                        </CustomFormItem>
                      </Col>

                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem
                          label="Apellido"
                          name="guest_lastname"
                          required
                        >
                          <CustomInput
                            placeholder="Apellido del paciente"
                            readOnly={!!selectedPatient || isViewMode}
                          />
                        </CustomFormItem>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem label="DNI" name="dni">
                          <CustomInput
                            placeholder="Número de identificación"
                            readOnly={!!selectedPatient || isViewMode}
                          />
                        </CustomFormItem>
                      </Col>

                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem label="Teléfono" name="phone" required>
                          <CustomInput
                            placeholder="Número de teléfono"
                            readOnly={!!selectedPatient || isViewMode}
                          />
                        </CustomFormItem>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem label="Pasaporte" name="passport">
                          <CustomInput
                            placeholder="Número de pasaporte"
                            readOnly={!!selectedPatient || isViewMode}
                          />
                        </CustomFormItem>
                      </Col>

                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem
                          label="Seguro Médico"
                          name="insurance_id"
                          required
                        >
                          <CustomSelect
                            placeholder="Seleccionar seguro..."
                            loading={loadingInsurances}
                            showSearch
                            optionFilterProp="children"
                            onChange={handleInsuranceChange}
                            readOnly={isViewMode}
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
                          </CustomSelect>
                        </CustomFormItem>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12} lg={12}>
                        <CustomFormItem
                          label="Código de Seguro"
                          name="insurance_code"
                        >
                          <CustomInput
                            placeholder="Código del seguro médico"
                            readOnly={
                              (!!selectedPatient && !editInsuranceCode) ||
                              isViewMode
                            }
                          />
                        </CustomFormItem>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

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
                      <CustomSelect
                        placeholder="Seleccionar especialista..."
                        loading={loadingEmployees}
                        showSearch
                        optionFilterProp="children"
                        readOnly={isViewMode}
                        notFoundContent={
                          loadingEmployees
                            ? "Cargando..."
                            : "No hay especialistas"
                        }
                      >
                        {employees.map((employee) => (
                          <Option key={employee.id} value={employee.id}>
                            {`${employee.firstname || ""} ${
                              employee.lastname || ""
                            }`}
                          </Option>
                        ))}
                      </CustomSelect>
                    </CustomFormItem>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={12}>
                    <CustomFormItem
                      label="Fecha"
                      name="appointment_date"
                      required
                    >
                      <CustomDatePicker
                        style={{ width: "100%" }}
                        placeholder="dd/mm/aaaa"
                        format="DD/MM/YYYY"
                        readOnly={isViewMode}
                        disabledDate={(current: Dayjs | null) =>
                          current ? current < dayjs().startOf("day") : false
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
                      <CustomTimePicker
                        style={{ width: "100%" }}
                        placeholder="Seleccionar hora..."
                        format="HH:mm"
                        readOnly={isViewMode}
                        onChange={() => {
                          if (!isViewMode) {
                            form.setFieldValue("end_time", undefined);
                          }
                        }}
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
                            if (isViewMode) return Promise.resolve();

                            const startTimeValue = getFieldValue("start_time");
                            if (!value || !startTimeValue) {
                              return Promise.resolve();
                            }
                            if (dayjs(value).isAfter(dayjs(startTimeValue))) {
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
                      <CustomTimePicker
                        style={{
                          width: "100%",
                          opacity: startTime && !isViewMode ? 1 : 0.5,
                        }}
                        placeholder={
                          startTime
                            ? "Hora de finalización..."
                            : "Primero seleccione hora de inicio"
                        }
                        format="HH:mm"
                        readOnly={!startTime || isViewMode}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>

                {mode !== "create" && (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={12} lg={12}>
                      <CustomFormItem label="Estado" name="status">
                        <CustomSelect
                          placeholder="Estado de la cita"
                          readOnly={isViewMode}
                        >
                          <Option value="programada">Programada</Option>
                          <Option value="completada">Completada</Option>
                          <Option value="cancelada">Cancelada</Option>
                        </CustomSelect>
                      </CustomFormItem>
                    </Col>
                  </Row>
                )}

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <CustomFormItem label="Notas" name="notes">
                      <CustomInput.TextArea
                        rows={4}
                        placeholder="Notas adicionales o comentarios sobre la cita..."
                        readOnly={isViewMode}
                        style={{
                          resize: "vertical",
                          minHeight: "100px",
                        }}
                      />
                    </CustomFormItem>
                  </Col>
                </Row>
              </div>

              {(mode === "create" || isEditing) && (
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
                      icon={mode === "create" ? undefined : <SaveOutlined />}
                      style={{ width: "100%", minHeight: "40px" }}
                    >
                      {getSubmitButtonText()}
                    </CustomButton>
                  </Col>
                </Row>
              )}
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
