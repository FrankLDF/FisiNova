import React from "react";
import { Button, Space, Typography, Card, Row, Col } from "antd";
import { UserOutlined, SearchOutlined, ClearOutlined } from "@ant-design/icons";
import type { Patient } from "../../features/patient/models/patient";
import { CustomButton } from "../Button/CustomButton";
import { getGenderLabel } from "../../utils/genderMapping";

const { Text } = Typography;

interface PatientSelectorFieldProps {
  selectedPatient: Patient | null;
  onOpenModal: () => void;
  onClear?: () => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
}

export const PatientSelectorField: React.FC<PatientSelectorFieldProps> = ({
  selectedPatient,
  onOpenModal,
  onClear,
  placeholder = "Seleccionar paciente...",
  allowClear = true,
  disabled = false,
}) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="small">
      {selectedPatient ? (
        <Card
          size="small"
          style={{
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          onClick={disabled ? undefined : onOpenModal}
        >
          <Row align="middle" justify="space-between">
            <Col flex="auto">
              <Space>
                <UserOutlined style={{ color: "#52c41a" }} />
                <Space direction="vertical" size={0}>
                  <Text strong style={{ color: "#52c41a" }}>
                    {`${selectedPatient.firstname} ${selectedPatient.lastname}`}
                  </Text>
                  <Space>
                    {selectedPatient.dni && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        DNI: {selectedPatient.dni}
                      </Text>
                    )}
                    {selectedPatient.phone && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tel: {selectedPatient.phone}
                      </Text>
                    )}
                    {selectedPatient.sex && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {getGenderLabel(selectedPatient.sex)}
                      </Text>
                    )}
                  </Space>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <CustomButton
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenModal();
                  }}
                  disabled={disabled}
                >
                  Cambiar
                </CustomButton>
                {allowClear && onClear && (
                  <CustomButton
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear();
                    }}
                    disabled={disabled}
                  >
                    Limpiar
                  </CustomButton>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      ) : (
        <CustomButton
          style={{ width: "100%", height: 60 }}
          icon={<SearchOutlined />}
          onClick={onOpenModal}
          disabled={disabled}
        >
          {placeholder}
        </CustomButton>
      )}
    </Space>
  );
};
