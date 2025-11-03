// src/features/therapy/pages/TherapistDashboard.tsx
import { Card, Row, Col, Statistic, Table, Tag, Tabs, Space, Badge, DatePicker } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { CustomButton } from "../../../components/Button/CustomButton";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { TherapySessionModal } from "../components/TherapySessionModal";
import therapyService from "../services/therapy";
import { showNotification } from "../../../utils/showNotification";

export const TherapistDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [therapies, setTherapies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState<any | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  useEffect(() => {
    loadTherapies();
  }, [selectedDate]);

  const loadTherapies = async () => {
    try {
      setLoading(true);
      const response = await therapyService.getMyTherapies(
        selectedDate.format("YYYY-MM-DD")
      );
      setTherapies(response?.data || []);
    } catch (error: any) {
      showNotification({
        type: "error",
        message: "Error al cargar terapias",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar terapias por estado
  const pendingTherapies = therapies.filter((t) => t.status === "confirmada");
  const inProgressTherapies = therapies.filter((t) => t.status === "en_atencion");
  const completedTherapies = therapies.filter((t) => t.status === "completada");

  // Estadísticas
  const stats = {
    pending: pendingTherapies.length,
    inProgress: inProgressTherapies.length,
    completedToday: completedTherapies.length,
    totalToday: therapies.length,
  };

  const handleStartTherapy = (therapy: any) => {
    setSelectedTherapy(therapy);
    setSessionModalOpen(true);
  };

  const handleViewTherapy = (therapy: any) => {
    setSelectedTherapy(therapy);
    setSessionModalOpen(true);
  };

  const handleSessionSuccess = () => {
    setSessionModalOpen(false);
    setSelectedTherapy(null);
    loadTherapies(); // Recargar lista
  };

  const columns: ColumnsType<any> = [
    {
      title: "Hora",
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            {dayjs(record.start_time, "HH:mm:ss").format("HH:mm")}
          </Tag>
          <span style={{ fontSize: 11, color: "#999" }}>
            {dayjs(record.end_time, "HH:mm:ss").format("HH:mm")}
          </span>
        </Space>
      ),
    },
    {
      title: "Paciente",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>
            {record.patient?.firstname} {record.patient?.lastname}
          </span>
          {record.patient?.dni && (
            <span style={{ fontSize: 12, color: "#666" }}>
              {record.patient?.dni}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Sesión",
      render: (_, record) => (
        <Badge
          count={`${record.session_number}/${record.total_sessions}`}
          style={{ backgroundColor: "#52c41a" }}
        />
      ),
    },
    {
      title: "Autorización",
      dataIndex: "authorization_number",
      render: (auth) => (
        <span style={{ fontSize: 11, color: "#666" }}>{auth}</span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          confirmada: { color: "blue", text: "Pendiente" },
          en_atencion: { color: "processing", text: "En Progreso" },
          completada: { color: "success", text: "Completada" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Acciones",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === "completada" ? (
            <CustomButton
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewTherapy(record)}
            >
              Ver
            </CustomButton>
          ) : record.status === "en_atencion" ? (
            <CustomButton
              type="primary"
              icon={<FireOutlined />}
              onClick={() => handleViewTherapy(record)}
            >
              Continuar
            </CustomButton>
          ) : (
            <CustomButton
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartTherapy(record)}
            >
              Iniciar
            </CustomButton>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <h2 style={{ margin: 0 }}>Dashboard del Terapista</h2>
              </Col>
              <Col>
                <Space>
                  <DatePicker
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                    format="DD/MM/YYYY"
                  />
                  <CustomButton
                    type="primary"
                    onClick={loadTherapies}
                    loading={loading}
                  >
                    Actualizar
                  </CustomButton>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="En Progreso"
              value={stats.inProgress}
              prefix={<FireOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completadas Hoy"
              value={stats.completedToday}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total del Día"
              value={stats.totalToday}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de terapias */}
      <Card>
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: "all",
              label: `Todas (${therapies.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={therapies}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "pending",
              label: `Pendientes (${stats.pending})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={pendingTherapies}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "inProgress",
              label: `En Progreso (${stats.inProgress})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={inProgressTherapies}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "completed",
              label: `Completadas (${stats.completedToday})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={completedTherapies}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Modal de sesión */}
      <TherapySessionModal
        open={sessionModalOpen}
        onClose={() => {
          setSessionModalOpen(false);
          setSelectedTherapy(null);
        }}
        onSuccess={handleSessionSuccess}
        therapy={selectedTherapy}
      />
    </>
  );
};