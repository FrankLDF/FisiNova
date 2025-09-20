import { Card, Row, Col, Select, DatePicker, TimePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CustomForm } from "../../../components/form/CustomForm";
import { CustomFormItem } from "../../../components/form/CustomFormItem";
import { CustomInput } from "../../../components/input/CustomInput";
import { CustomButton } from "../../../components/Button/CustomButton";
import { useCustomMutation } from "../../../hooks/UseCustomMutation";
import { showNotification } from "../../../utils/showNotification";
import appointmentService from "../services/appointment";
import dayjs from "dayjs";

const { TextArea } = CustomInput;
const { Option } = Select;

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
}

interface Patient {
  id: number;
  firstname: string;
  lastname: string;
  dni?: string;
}

export const CreateAppointment = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await appointmentService.getEmployees();
      
      const employeeData = response?.data?.data || response?.data || [];
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      showNotification({
        type: "error",
        message: "Error al cargar empleados",
      });
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadPatients = async (search?: string) => {
    try {
      setLoadingPatients(true);
      const response = await appointmentService.getPatients(search);
      
      const patientData = response?.data?.data || response?.data || [];
      setPatients(Array.isArray(patientData) ? patientData : []);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      showNotification({
        type: "error",
        message: "Error al cargar pacientes",
      });
      setPatients([]);
    } finally {
      setLoadingPatients(false);
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
      console.error('Error creando cita:', err);
      showNotification({
        type: "error",
        message: err.response?.error?.message || err.response?.message || "Error al crear la cita",
      });
    },
  });

  const onFinish = (values: any) => {
    try {
      const appointmentData = {
        ...values,
        appointment_date: values.appointment_date?.format("YYYY-MM-DD"),
        start_time: values.start_time?.format("HH:mm"),
        end_time: values.end_time?.format("HH:mm"),
      };

      console.log('Datos a enviar:', appointmentData);

      createAppointment(appointmentData);
    } catch (error) {
      console.error('Error procesando formulario:', error);
      showNotification({
        type: "error",
        message: "Error procesando los datos del formulario",
      });
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
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
              layout="vertical"
              onFinish={onFinish}
              style={{ maxWidth: 600 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <CustomFormItem
                    label="Médico/Terapeuta"
                    name="employee_id"
                    required
                  >
                    <Select
                      placeholder="Seleccionar profesional"
                      loading={loadingEmployees}
                      showSearch
                      optionFilterProp="children"
                      notFoundContent={loadingEmployees ? "Cargando..." : "No hay empleados"}
                    >
                      {employees.map((employee) => (
                        <Option key={employee.id} value={employee.id}>
                          {`${employee.firstname || ''} ${employee.lastname || ''}`}
                        </Option>
                      ))}
                    </Select>
                  </CustomFormItem>
                </Col>

                <Col span={12}>
                  <CustomFormItem label="Paciente" name="patient_id">
                    <Select
                      placeholder="Seleccionar paciente (opcional)"
                      loading={loadingPatients}
                      showSearch
                      allowClear
                      onSearch={(value) => {
                        if (value && value.length >= 2) {
                          loadPatients(value);
                        } else if (!value) {
                          loadPatients();
                        }
                      }}
                      onFocus={() => loadPatients()}
                      optionFilterProp="children"
                      notFoundContent={loadingPatients ? "Buscando..." : "No hay pacientes"}
                      filterOption={false}
                    >
                      {patients.map((patient) => (
                        <Option key={patient.id} value={patient.id}>
                          {`${patient.firstname || ''} ${patient.lastname || ''}`}
                          {patient.dni && ` - ${patient.dni}`}
                        </Option>
                      ))}
                    </Select>
                  </CustomFormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <CustomFormItem
                    label="Fecha"
                    name="appointment_date"
                    required
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Seleccionar fecha"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </CustomFormItem>
                </Col>

                <Col span={8}>
                  <CustomFormItem
                    label="Hora Inicio"
                    name="start_time"
                    required
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      placeholder="Hora inicio"
                      format="HH:mm"
                    />
                  </CustomFormItem>
                </Col>

                <Col span={8}>
                  <CustomFormItem label="Hora Fin" name="end_time" required>
                    <TimePicker
                      style={{ width: "100%" }}
                      placeholder="Hora fin"
                      format="HH:mm"
                    />
                  </CustomFormItem>
                </Col>
              </Row>

              {/* Campos para pacientes walk-in */}
              <Row gutter={16}>
                <Col span={8}>
                  <CustomFormItem label="DNI (si no hay paciente)" name="dni">
                    <CustomInput placeholder="DNI del paciente" />
                  </CustomFormItem>
                </Col>

                <Col span={8}>
                  <CustomFormItem label="Teléfono" name="phone">
                    <CustomInput placeholder="Teléfono de contacto" />
                  </CustomFormItem>
                </Col>

                <Col span={8}>
                  <CustomFormItem label="Código Seguro" name="insurance_code">
                    <CustomInput placeholder="Código de seguro" />
                  </CustomFormItem>
                </Col>
              </Row>

              <CustomFormItem label="Notas" name="notes">
                <TextArea
                  rows={3}
                  placeholder="Notas adicionales sobre la cita"
                />
              </CustomFormItem>

              <CustomFormItem>
                <Row gutter={16}>
                  <Col>
                    <CustomButton
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                    >
                      Crear Cita
                    </CustomButton>
                  </Col>
                  <Col>
                    <CustomButton
                      type="default"
                      onClick={() => navigate("/consult-appointments")}
                    >
                      Cancelar
                    </CustomButton>
                  </Col>
                </Row>
              </CustomFormItem>
            </CustomForm>
          </Card>
        </Col>
      </Row>
    </div>
  );
};