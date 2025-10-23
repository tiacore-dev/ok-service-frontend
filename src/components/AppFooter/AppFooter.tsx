import * as React from "react";
import { Flex, Layout, Space } from "antd";
import { isMobile } from "../../utils/isMobile";
import {
  EnvironmentOutlined,
  FileDoneOutlined,
  IdcardOutlined,
  LineChartOutlined,
  ProfileOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

export const AppFooter = () => {
  const { Footer } = Layout;
  const navigate = useNavigate();
  const role = useSelector(getCurrentRole);

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
    </Space>,
  );

  items.push(
    <Space
      key="home"
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/home");
      }}
    >
      <LineChartOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Главная</div>
    </Space>,
  );

  if (role !== RoleId.USER) {
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
      </Space>,
    );

    items.push(
      <Space
        key="cities"
        size="small"
        direction="vertical"
        style={{ textAlign: "center" }}
        onClick={() => {
          navigate("/cities");
        }}
      >
        <EnvironmentOutlined style={{ fontSize: "20px" }} />
        <div style={{ fontSize: "12px" }}>Города</div>
      </Space>,
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
        <ProfileOutlined style={{ fontSize: "20px" }} />
        <div style={{ fontSize: "12px" }}>Объекты</div>
      </Space>,
    );
  }

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
      <div style={{ fontSize: "12px" }}>Профиль</div>
    </Space>,
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
        padding: "24px 50px",
        textAlign: "center",
      }}
    >
      Tiacore c2025
    </Footer>
  );
};
