// src/features/therapy/pages/TherapistDashboard.tsx
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Tabs,
  Space,
  Badge,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { CustomButton } from "../../../components/Button/CustomButton";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { TherapySessionModal } from "../components/TherapySessionModal";
import { isToday } from "../../../utils/dateHelpers";

// Mock Data
const generateMockTherapies = () => {
  const statuses = ["pending", "in_progress", "completed"];
  const patients = [
    {
      id: 1,
      name: "María González",
      dni: "001-1234567-8",
      phone: "809-555-0101",
    },
    { id: 2, name: "Juan Pérez", dni: "001-2345678-9", phone: "809-555-0102" },
    {
      id: 3,
      name: "Ana Martínez",
      dni: "001-3456789-0",
      phone: "809-555-0103",
    },
    {
      id: 4,
      name: "Carlos Rodríguez",
      dni: "001-4567890-1",
      phone: "809-555-0104",
    },
    {
      id: 5,
      name: "Laura Fernández",
      dni: "001-5678901-2",
      phone: "809-555-0105",
    },
  ];

  const procedures = [
    "Terapia Física",
    "Rehabilitación Muscular",
    "Terapia Ocupacional",
    "Masaje Terapéutico",
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    patient: patients[i % patients.length],
    date: dayjs()
      .add(Math.floor(i / 3) - 1, "days")
      .format("YYYY-MM-DD"),
    startTime: `${8 + (i % 6)}:00`,
    endTime: `${9 + (i % 6)}:00`,
    status: statuses[Math.floor(i / 5) % statuses.length],
    procedure: procedures[i % procedures.length],
    sessionNumber: (i % 10) + 1,
    totalSessions: 10,
    authorizationNumber: `AUTH-2025-${String(i + 100).padStart(3, "0")}`,
    notes: i % 3 === 0 ? "Paciente con progreso favorable" : "",
  }));
};

interface Therapy {
  id: number;
  patient: {
    id: number;
    name: string;
    dni: string;
    phone: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  procedure: string;
  sessionNumber: number;
  totalSessions: number;
  authorizationNumber: string;
  notes?: string;
}

export const TherapistDashboard = () => {
  const [therapies] = useState<Therapy[]>(generateMockTherapies());
  const [selectedTherapy, setSelectedTherapy] = useState<Therapy | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  // Filtrar terapias por estado
  const pendingTherapies = therapies.filter((t) => t.status === "pending");
  const inProgressTherapies = therapies.filter(
    (t) => t.status === "in_progress"
  );
  const completedTherapies = therapies.filter(
    (t) => t.status === "completed" && isToday(t.date)
  );

  // Estadísticas
  const stats = {
    pending: pendingTherapies.length,
    inProgress: inProgressTherapies.length,
    completedToday: completedTherapies.length,
    totalToday: therapies.filter((t) => isToday(t.date)).length,
  };

  const handleStartTherapy = (therapy: Therapy) => {
    console.log("🎯 Iniciando terapia:", therapy);
    // Simular inicio de terapia
    therapy.status = "in_progress";
    setSelectedTherapy(therapy);
    setSessionModalOpen(true);
  };

  const handleViewTherapy = (therapy: Therapy) => {
    console.log("👁️ Ver terapia:", therapy);
    setSelectedTherapy(therapy);
    setSessionModalOpen(true);
  };

  const handleCompleteSession = (data: any) => {
    console.log("✅ Sesión completada:", data);
    if (selectedTherapy) {
      selectedTherapy.status = "completed";
    }
    setSessionModalOpen(false);
    setSelectedTherapy(null);
  };

  const columns: ColumnsType<Therapy> = [
    {
      title: "Hora",
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            {record.startTime}
          </Tag>
          <span style={{ fontSize: 11, color: "#999" }}>{record.endTime}</span>
        </Space>
      ),
    },
    {
      title: "Paciente",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.patient.name}</span>
          {record.patient.dni && (
            <span style={{ fontSize: 12, color: "#666" }}>
              {record.patient.dni}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Procedimiento",
      dataIndex: "procedure",
      render: (procedure) => <Tag color="cyan">{procedure}</Tag>,
    },
    {
      title: "Sesión",
      render: (_, record) => (
        <Space>
          <Badge
            count={`${record.sessionNumber}/${record.totalSessions}`}
            style={{ backgroundColor: "#52c41a" }}
          />
        </Space>
      ),
    },
    {
      title: "Autorización",
      dataIndex: "authorizationNumber",
      render: (auth) => (
        <span style={{ fontSize: 11, color: "#666" }}>{auth}</span>
      ),
    },
    {
      title: "Acciones",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === "completed" ? (
            <CustomButton
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewTherapy(record)}
            >
              Ver
            </CustomButton>
          ) : (
            <CustomButton
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartTherapy(record)}
            >
              {record.status === "in_progress" ? "Continuar" : "Iniciar"}
            </CustomButton>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 16px" }}>
      <Row gutter={[16, 16]}>
        {/* Estadísticas */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="En Progreso"
              value={stats.inProgress}
              prefix={<FireOutlined />}
              valueStyle={{ color: "#1890ff" }}
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
              title="Total Hoy"
              value={stats.totalToday}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        {/* Tablas con tabs */}
        <Col span={24}>
          <Card>
            <Tabs
              defaultActiveKey="pending"
              items={[
                {
                  key: "pending",
                  label: (
                    <span>
                      <Badge count={pendingTherapies.length} offset={[10, 0]}>
                        Pendientes
                      </Badge>
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={pendingTherapies}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5 }}
                    />
                  ),
                },
                {
                  key: "progress",
                  label: (
                    <span>
                      <Badge
                        count={inProgressTherapies.length}
                        offset={[10, 0]}
                      >
                        En Progreso
                      </Badge>
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={inProgressTherapies}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5 }}
                    />
                  ),
                },
                {
                  key: "completed",
                  label: (
                    <span>
                      <Badge count={completedTherapies.length} offset={[10, 0]}>
                        Completadas
                      </Badge>
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={completedTherapies}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de sesión de terapia */}
      <TherapySessionModal
        open={sessionModalOpen}
        onClose={() => {
          setSessionModalOpen(false);
          setSelectedTherapy(null);
        }}
        onComplete={handleCompleteSession}
        therapy={selectedTherapy}
      />
    </div>
  );
};
