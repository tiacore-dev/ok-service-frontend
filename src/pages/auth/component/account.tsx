import { Button, Descriptions, Space } from "antd";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useAuthData } from "../../../hooks/useAuth";
import { authlogout } from "../../../store/modules/auth";
import { useloadSourse } from "../../../components/App/App";
import { useApi } from "../../../hooks/useApi";

interface notificationsSubscribeData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
interface notificationsSubscribeResponse {
  status: boolean;
}

export const Account = () => {
  const data = useAuthData();
  const dispatch = useDispatch();
  const { apiPost } = useApi();

  const handleSubscribe = React.useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_WP,
      });
      const subscriptionData = JSON.parse(JSON.stringify(subscription));
      apiPost<notificationsSubscribeResponse, notificationsSubscribeData>(
        "subscriptions",
        "subscribe",
        subscriptionData
      );
    } catch (error) {
      console.error("Error subscribing to Push:", error);
    }
  }, []);

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
        <Button onClick={handleSubscribe}>Подписаться</Button>

        <Button
          onClick={() => {
            dispatch(authlogout());
          }}
        >
          Выход
        </Button>
      </Space>
    </>
  );
};
