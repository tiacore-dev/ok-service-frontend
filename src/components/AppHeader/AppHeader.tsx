import * as React from "react";
import { Layout, Menu, Typography } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "./logo.png";
import { IState } from "../../store/modules";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

const { Header } = Layout;

export const AppHeader = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const desktopItems: ItemType[] = [];
  const role = useSelector(getCurrentRole);
  const navigate = useNavigate();
  const { Title } = Typography;
  const showBackButton = useSelector(
    (state: IState) => state.settings.generalSettings?.showBackButton,
  );
  const back = () => {
    navigate(-1);
  };
  const appHeaderTitle = useSelector(
    (state: IState) => state.settings.generalSettings?.appHeaderTitle,
  );

  desktopItems.push({
    key: "main",
    label: "Главная",
    onClick: () => {
      navigate("/home");
    },
  });
  if (role !== RoleId.USER) {
    desktopItems.push({
      key: "objects",
      label: "Объекты",
      onClick: () => {
        navigate("/objects");
      },
    });

    desktopItems.push({
      key: "projects",
      label: "Спецификации",
      onClick: () => {
        navigate("/projects");
      },
    });

    desktopItems.push({
      key: "users",
      label: "Пользователи",
      onClick: () => {
        navigate("/users");
      },
    });

    desktopItems.push({
      key: "works",
      label: "Каталог работ",
      onClick: () => {
        navigate("/works");
      },
    });
  }

  desktopItems.push({
    key: "shifts",
    label: "Смены",
    onClick: () => {
      navigate("/shifts");
    },
  });

  desktopItems.push({
    key: "account",
    label: "Аккаунт",
    onClick: () => {
      navigate("/account");
    },
  });

  return isMobile ? (
    <Header className={"header"} style={{ backgroundColor: "white" }}>
      {showBackButton && (
        <ArrowLeftOutlined
          onClick={back}
          style={{ margin: "auto 12px  auto -24px", fontSize: "24px" }}
        />
      )}
      <Title level={3} style={{ margin: "auto 0" }}>
        {appHeaderTitle}
      </Title>
    </Header>
  ) : (
    <Header className={"header"} style={{ backgroundColor: "white" }}>
      <img className="header__logo" src={logo} />
      <Menu
        className={"header__menu"}
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={desktopItems}
      />
    </Header>
  );
});
