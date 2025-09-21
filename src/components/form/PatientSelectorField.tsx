import React from "react";
import { Button, Space, Typography, Card, Row, Col } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  ClearOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
  height?: number;
  width?: number | string;
  showInfo?: boolean;
}

export const PatientSelectorField: React.FC<PatientSelectorFieldProps> = ({
  selectedPatient,
  onOpenModal,
  onClear,
  placeholder = "Seleccionar paciente...",
  allowClear = true,
  disabled = false,
  height = 60,
  width = "100%",
  showInfo = true,
}) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="small">
      {selectedPatient ? (
        showInfo ? (
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
          <div style={{ position: "relative", display: "inline-block" }}>
            <CustomButton
              style={{
                width: width,
                height: height,
                background: "#f6ffed",
                borderColor: "#b7eb8f",
                color: "#52c41a",
                paddingRight: allowClear && onClear ? "32px" : "16px",
              }}
              icon={<UserOutlined />}
              onClick={onOpenModal}
              disabled={disabled}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth:
                    typeof width === "number" ? `${width - 80}px` : "120px",
                }}
              >
                {`${selectedPatient.firstname} ${selectedPatient.lastname}`}
              </span>
            </CustomButton>

            {allowClear && onClear && (
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                disabled={disabled}
                style={{
                  position: "absolute",
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "24px",
                  height: "24px",
                  border: "none",
                  background: "transparent",
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff4d4f";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#999";
                }}
              />
            )}
          </div>
        )
      ) : (
        <CustomButton
          style={{ width: width, height: height }}
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
