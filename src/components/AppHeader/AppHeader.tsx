import * as React from "react";
import { Dropdown, Layout, Menu, Typography } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logo from "./logo.png";
import { IState } from "../../store/modules";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  BarsOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { authlogout, getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

const { Header } = Layout;

export const AppHeader = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const desktopItems: ItemType[] = [];
  const role = useSelector(getCurrentRole);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { Title } = Typography;
  const showBackButton = useSelector(
    (state: IState) => state.settings.generalSettings?.showBackButton,
  );
  const userName = useSelector((state: IState) => state.auth.name);
  const userLogin = useSelector((state: IState) => state.auth.login);
  const back = () => {
    navigate(-1);
  };
  const appHeaderTitle = useSelector(
    (state: IState) => state.settings.generalSettings?.appHeaderTitle,
  );
  const userDisplayName = userName ?? userLogin ?? "Пользователь";

  desktopItems.push({
    key: "main",
    label: "Главная",
    icon: <BarChartOutlined />,
    onClick: () => {
      navigate("/home");
    },
  });

  desktopItems.push({
    key: "shifts",
    label: "Смены",
    icon: <FileDoneOutlined />,
    onClick: () => {
      navigate("/shifts");
    },
  });

  if (role !== RoleId.USER) {
    desktopItems.push({
      key: "objects",
      label: "Объекты",
      icon: <BarsOutlined />,
      onClick: () => {
        navigate("/objects");
      },
    });

    desktopItems.push({
      label: "Документы",
      key: "documents",
      icon: <FileTextOutlined />,
      children: [
        {
          key: "leaves",
          label: "Листы отсутствия",
          onClick: () => {
            navigate("/leaves");
          },
        },
      ],
    });

    desktopItems.push({
      label: "Справочники",
      key: "dictionaries",
      icon: <SettingOutlined />,
      children: [
        {
          key: "cities",
          label: "Города",
          onClick: () => {
            navigate("/cities");
          },
        },

        {
          key: "users",
          label: "Пользователи",
          onClick: () => {
            navigate("/users");
          },
        },

        {
          key: "works",
          label: "Виды работ",
          onClick: () => {
            navigate("/works");
          },
        },
        {
          key: "materials",
          label: "Материалы",
          onClick: () => {
            navigate("/materials");
          },
        },
      ],
    });
  }

  desktopItems.push({
    key: "manual",
    label: "Справка",
    icon: <InfoCircleOutlined />,
    onClick: () => {
      navigate("/manual");
    },
  });

  const accountMenuItems: MenuProps["items"] = [
    {
      key: "account",
      label: "Аккаунт",
    },
    {
      key: "logout",
      label: "Выйти",
    },
  ];

  const handleAccountMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "account") {
      navigate("/account");
      return;
    }
    if (key === "logout") {
      dispatch(authlogout());
    }
  };

  return isMobile ? (
    <Header className={"header"}>
      {showBackButton && (
        <ArrowLeftOutlined
          onClick={back}
          className="header__back"
        />
      )}
      <Title level={3} className="header__title">
        {appHeaderTitle}
      </Title>
    </Header>
  ) : (
    <Header className={"header"}>
      <img className="header__logo" src={logo} />
      <Menu
        className={"header__menu"}
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        _internalDisableMenuItemTitleTooltip
        items={desktopItems}
      />
      <div className="header__user">
        <span className="header__user-name" title={userDisplayName}>
          {userDisplayName}
        </span>
        <Dropdown
          placement="bottomRight"
          trigger={["click"]}
          menu={{ items: accountMenuItems, onClick: handleAccountMenuClick }}
        >
          <button
            type="button"
            className="header__user-avatar"
            aria-label="Пользователь"
          >
            <UserOutlined />
          </button>
        </Dropdown>
      </div>
    </Header>
  );
});
