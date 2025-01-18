import * as React from "react";
import { Flex, Layout, Space } from "antd";
import { isMobile } from "../../utils/isMobile";
import {
  BankOutlined,
  FileDoneOutlined,
  IdcardOutlined,
  ProfileOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export const AppFooter = () => {
  const { Footer } = Layout;
  const navigate = useNavigate();

  const items: React.JSX.Element[] = [];

  items.push(
    <Space
      key="shifts"
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/shifts");
      }}
    >
      <FileDoneOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Смены</div>
    </Space>
  );

  items.push(
    <Space
      key="users"
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/users");
      }}
    >
      <TeamOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Пользователи</div>
    </Space>
  );

  items.push(
    <Space
      key="objects"
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/objects");
      }}
    >
      <BankOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Объекты</div>
    </Space>
  );

  items.push(
    <Space
      key="projects"
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/projects");
      }}
    >
      <ProfileOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Спецификации</div>
    </Space>
  );

  items.push(
    <Space
      key="account"
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/account");
      }}
    >
      <IdcardOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Аккаунт</div>
    </Space>
  );

  return isMobile() ? (
    <Footer
      style={{
        padding: "12px 12px",
      }}
    >
      <Flex justify="space-around" align="center">
        {items}
      </Flex>
    </Footer>
  ) : (
    <Footer
      style={{
        padding: "25px 50px",
        textAlign: "center",
      }}
    >
      Tiacore ©2025
    </Footer>
  );
};
