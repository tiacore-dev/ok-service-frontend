import { Button, Descriptions, Space } from "antd";
import * as React from "react";
import { useAuthData } from "../../../hooks/useAuth";
import { useLogout } from "../../../hooks/useLogout";
import { useloadSourse } from "../../../components/App/App";

export const Account = () => {
  const data = useAuthData();
  const { logout, isLoggingOut } = useLogout();

  const { load, clearStates } = useloadSourse();
  const refresh = () => {
    clearStates();
    load();
  };

  return (
    <>
      <Descriptions
        title="Данные пользователя"
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Имя пользователя">
          {data.name}
        </Descriptions.Item>
      </Descriptions>
      <Space direction="vertical">
        <Button onClick={refresh}>Обновить данные</Button>
        <Button onClick={logout} loading={isLoggingOut}>
          Выход
        </Button>
      </Space>
    </>
  );
};
