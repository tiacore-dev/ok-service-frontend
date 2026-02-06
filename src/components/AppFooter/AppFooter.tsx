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
import "./AppFooter.less";

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
      className="app-footer__item"
      onClick={() => {
        navigate("/shifts");
      }}
    >
      <FileDoneOutlined className="app-footer__icon" />
      <div className="app-footer__label">Смены</div>
    </Space>,
  );

  items.push(
    <Space
      key="home"
      size="small"
      direction="vertical"
      className="app-footer__item"
      onClick={() => {
        navigate("/home");
      }}
    >
      <LineChartOutlined className="app-footer__icon" />
      <div className="app-footer__label">Главная</div>
    </Space>,
  );

  if (role !== RoleId.USER) {
    items.push(
      <Space
        key="users"
        size="small"
        direction="vertical"
        className="app-footer__item"
        onClick={() => {
          navigate("/users");
        }}
      >
        <TeamOutlined className="app-footer__icon" />
        <div className="app-footer__label">Пользователи</div>
      </Space>,
    );

    items.push(
      <Space
        key="cities"
        size="small"
        direction="vertical"
        className="app-footer__item"
        onClick={() => {
          navigate("/cities");
        }}
      >
        <EnvironmentOutlined className="app-footer__icon" />
        <div className="app-footer__label">Города</div>
      </Space>,
    );

    items.push(
      <Space
        key="objects"
        size="small"
        direction="vertical"
        className="app-footer__item"
        onClick={() => {
          navigate("/objects");
        }}
      >
        <ProfileOutlined className="app-footer__icon" />
        <div className="app-footer__label">Объекты</div>
      </Space>,
    );
  }

  items.push(
    <Space
      key="account"
      size="small"
      direction="vertical"
      className="app-footer__item"
      onClick={() => {
        navigate("/account");
      }}
    >
      <IdcardOutlined className="app-footer__icon" />
      <div className="app-footer__label">Профиль</div>
    </Space>,
  );

  return isMobile() ? (
    <Footer
      className="app-footer"
    >
      <Flex justify="space-around" align="center">
        {items}
      </Flex>
    </Footer>
  ) : null;
};
