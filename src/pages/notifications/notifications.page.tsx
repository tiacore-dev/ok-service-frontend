import {
  Alert,
  Button,
  Card,
  Empty,
  List,
  Pagination,
  Spin,
  Tabs,
  Typography,
} from "antd";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotificationSubscriptionsQuery,
  useNotificationsQuery,
  useMarkNotificationViewedMutation,
  useRevokeNotificationSubscriptionMutation,
} from "../../queries/notifications";

export const Notifications = () => {
  const navigate = useNavigate();
  const [offset, setOffset] = React.useState(0);
  const limit = 20;
  const notifications = useNotificationsQuery({ offset, limit });
  const subscriptions = useNotificationSubscriptionsQuery();
  const revoke = useRevokeNotificationSubscriptionMutation();
  const markViewed = useMarkNotificationViewedMutation();

  const history = (
    <>
      {notifications.isLoading ? (
        <Spin />
      ) : notifications.isError ? (
        <Alert type="error" message="Не удалось загрузить уведомления" />
      ) : (
        <List
          dataSource={notifications.data?.items ?? []}
          locale={{ emptyText: <Empty description="Нет уведомлений" /> }}
          renderItem={(item) => (
            <List.Item
              onClick={async () => {
                if (!item.viewed) {
                  await markViewed.mutateAsync(item.notification_id);
                }
                if (item.route) navigate(item.route);
              }}
              style={{ cursor: item.route ? "pointer" : "default" }}
            >
              <List.Item.Meta title={item.title} description={item.body} />
              <Typography.Text type="secondary">
                {new Date(item.created_at).toLocaleString("ru-RU")}
              </Typography.Text>
            </List.Item>
          )}
        />
      )}
      <Pagination
        current={offset / limit + 1}
        pageSize={limit}
        total={
          offset +
          (notifications.data?.items.length ?? 0) +
          (notifications.data?.items.length === limit ? limit : 0)
        }
        onChange={(page) => setOffset((page - 1) * limit)}
        showSizeChanger={false}
      />
    </>
  );

  const devices = subscriptions.isLoading ? (
    <Spin />
  ) : subscriptions.isError ? (
    <Alert type="error" message="Не удалось загрузить устройства" />
  ) : (
    <List
      dataSource={(subscriptions.data?.items ?? []).filter(
        (item) => item.active,
      )}
      locale={{ emptyText: <Empty description="Активных устройств нет" /> }}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              danger
              type="link"
              onClick={() => revoke.mutate(item.subscription_id)}
              loading={revoke.isPending}
            >
              Отключить
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={item.platform === "web" ? "Браузер" : item.platform}
            description={`Подключено: ${new Date(item.created_at).toLocaleString("ru-RU")}`}
          />
        </List.Item>
      )}
    />
  );

  return (
    <main style={{ padding: "0 20px 20px 20px" }}>
      <Tabs
        items={[
          {
            key: "history",
            label: "История",
            children: <Card>{history}</Card>,
          },
          {
            key: "devices",
            label: "Мои устройства",
            children: <Card>{devices}</Card>,
          },
        ]}
      />
    </main>
  );
};
