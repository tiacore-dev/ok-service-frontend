import { Button, Descriptions, Space } from "antd";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useAuthData } from "../../../hooks/useAuth";
import { authlogout } from "../../../store/modules/auth";
import { useloadSourse } from "../../../components/App/App";
import { useApi } from "../../../hooks/useApi";

interface notificationsSubscribeData {
  endpoint: string;
  p256dh: string;
  auth: string;
}
interface notificationsSubscribeResponse {
  status: boolean;
}

export const Account = () => {
  const data = useAuthData();
  const dispatch = useDispatch();
  const { apiPost } = useApi();

  const handleSubscribe = React.useCallback(async () => {
    // navigator.serviceWorker.ready.then((reg) => {
    //   reg.pushManager.getSubscription().then((subscription) => {
    //     const options = subscription.options;
    //     console.log(options.applicationServerKey); // the public key
    //   });
    // });

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log(registration);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_WP,
      });
      console.log(subscription);

      const subscriptionData = JSON.parse(JSON.stringify(subscription));
      console.log(subscriptionData);

      apiPost<notificationsSubscribeResponse, notificationsSubscribeData>(
        "subscriptions",
        "subscribe",
        {
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        }
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
        <Button size="large" onClick={handleSubscribe}>
          Подписаться
        </Button>

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
