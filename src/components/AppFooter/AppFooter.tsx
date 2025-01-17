import * as React from "react";
import { Flex, Layout, Space } from "antd";
import { isMobile } from "../../utils/isMobile";
import {
  AppstoreOutlined,
  IdcardOutlined,
  InsertRowBelowOutlined,
  MailOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
// import { checkPermission } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const AppFooter = () => {
  const { Footer } = Layout;
  const navigate = useNavigate();

  const items: React.JSX.Element[] = [];

  items.push(
    <Space
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/shifts");
      }}
    >
      <MailOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Смены</div>
    </Space>
  );

  items.push(
    <Space
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/users");
      }}
    >
      <InsertRowBelowOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Пользователи</div>
    </Space>
  );

  items.push(
    <Space
      size="small"
      direction="vertical"
      style={{ textAlign: "center" }}
      onClick={() => {
        navigate("/objects");
      }}
    >
      <AppstoreOutlined style={{ fontSize: "20px" }} />
      <div style={{ fontSize: "12px" }}>Объекты</div>
    </Space>
  );

  items.push(
    <Space
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
