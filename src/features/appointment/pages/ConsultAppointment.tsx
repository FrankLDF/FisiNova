import {
  Card,
  Table,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "../../../components/Button/CustomButton";
import { CustomConfirm } from "../../../components/pop-confirm/CustomConfirm";
import { useCustomMutation } from "../../../hooks/UseCustomMutation";
import { showNotification } from "../../../utils/showNotification";
import appointmentService from "../services/appointment";
import type { Appointment, AppointmentFilters } from "../models/appointment";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { showHandleError } from "../../../utils/handleError";

const { RangePicker } = DatePicker;
const { Option } = Select;

export const ConsultAppointments = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AppointmentFilters>({
    paginate: 15,
  });

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedActive, setSelectedActive] = useState<string | undefined>(
    undefined
  );

  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => appointmentService.getAppointments(filters),
  });

  const { mutate: deleteAppointment } = useCustomMutation({
    execute: appointmentService.deleteAppointment,
    onSuccess: () => {
      showNotification({
        type: "success",
        message: "Cita eliminada exitosamente",
      });
      refetch();
    },
    onError: (err) => {
      showHandleError(err);
    },
  });

  const statusColors: Record<string, string> = {
    programada: "blue",
    completada: "green",
    cancelada: "error",
    inactiva: "warning",
  };

  const getStatusColor = (status?: string) => {
    return status ? statusColors[status] || "default" : "default";
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: "Fecha",
      dataIndex: "appointment_date",
      key: "appointment_date",
      render: (date: string) => {
        if (!date) return "-";
        return dayjs(date).format("DD/MM/YYYY");
      },
      sorter: true,
    },
    {
      title: "Hora",
      key: "time",
      render: (_, record) => {
        const startTime = record.start_time
          ? dayjs(record.start_time, "HH:mm").format("HH:mm")
          : "--:--";
        const endTime = record.end_time
          ? dayjs(record.end_time, "HH:mm").format("HH:mm")
          : "--:--";

        return (
          <span>
            {startTime} - {endTime}
          </span>
        );
      },
    },
    {
      title: "Profesional",
      key: "employee",
      render: (_, record) => (
        <span>
          {record.employee
            ? `${record.employee.firstname || ""} ${
                record.employee.lastname || ""
              }`
            : "Sin asignar"}
        </span>
      ),
    },
    {
      title: "Paciente",
      key: "patient",
      render: (_, record) => (
        <span>
          {record.patient
            ? `${record.patient.firstname || ""} ${
                record.patient.lastname || ""
              }`
            : record.guest_firstname || record.guest_lastname
            ? `Nuevo: ${record.guest_firstname} ${record.guest_lastname}`
            : "Sin asignar"}
        </span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Notas",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (notes: string) =>
        notes ? (
          <Tooltip title={notes}>
            <span>
              {notes.length > 30 ? notes.substring(0, 30) + "..." : notes}
            </span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/appointments/${record.id}`)}
              title="Ver detalles"
            />
          </Tooltip>

          <Tooltip title="Editar">
            <CustomButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/appointments/${record.id}/edit`)}
              title="Editar"
            />
          </Tooltip>

          <CustomConfirm
            title="¿Estás seguro de eliminar esta cita?"
            onConfirm={() => deleteAppointment(record.id!)}
          >
            <Tooltip title="Eliminar">
              <CustomButton
                type="text"
                danger
                icon={<DeleteOutlined />}
                title="Eliminar"
              />
            </Tooltip>
          </CustomConfirm>
        </Space>
      ),
    },
  ];

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ paginate: 15 });
    setDateRange(null);
    setSelectedStatus(undefined);
    setSelectedActive(undefined);
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    const validDates =
      dates && dates[0] && dates[1]
        ? ([dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs])
        : null;

    setDateRange(validDates);

    if (dates) {
      handleFilterChange("start_date", dates[0]?.format("YYYY-MM-DD"));
      handleFilterChange("end_date", dates[1]?.format("YYYY-MM-DD"));
    } else {
      handleFilterChange("start_date", undefined);
      handleFilterChange("end_date", undefined);
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    handleFilterChange("status", value);
  };

  const handleActiveChange = (value: string) => {
    setSelectedActive(value);
    handleFilterChange("active", value);
  };

  const tableData =
    appointmentsData?.data?.data || appointmentsData?.data || [];
  const pagination = {
    current: appointmentsData?.data?.current_page || 1,
    pageSize: appointmentsData?.data?.per_page || filters.paginate || 15,
    total: appointmentsData?.data?.total || tableData.length || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total: ${total} citas`,
    onChange: (page: number, size?: number) => {
      handleFilterChange("paginate", size);
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Filtros de Búsqueda">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <label>Rango de fechas:</label>
                <RangePicker
                  style={{ width: "100%" }}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Estado:</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Seleccionar estado"
                  allowClear
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  <Option value="programada">Programada</Option>
                  <Option value="completada">Completada</Option>
                  <Option value="cancelada">Cancelada</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <label>Activo:</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Estado"
                  allowClear
                  value={selectedActive}
                  onChange={handleActiveChange}
                >
                  <Option value="true">Activo</Option>
                  <Option value="false">Inactivo</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <CustomButton type="default" onClick={clearFilters}>
                    Limpiar Filtros
                  </CustomButton>
                </Space>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <CustomButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/create-appointment")}
                  style={{ width: "100%" }}
                >
                  Nueva Cita
                </CustomButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Lista de Citas">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              rowKey="id"
              pagination={pagination}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
