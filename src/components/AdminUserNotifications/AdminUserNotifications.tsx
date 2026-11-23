import { Card, Empty, List, Pagination, Spin, Tabs, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import * as React from "react";
import {
  useAdminNotificationsQuery,
  useAdminSubscriptionsQuery,
} from "../../queries/notifications";

interface AdminUserNotificationsProps {
  userId: string;
}

const formatDate = (value?: number | null) => {
  if (!value) return "—";
  const timestamp =
    value < 100_000_000_000
      ? value * 1000
      : value > 100_000_000_000_000
        ? value / 1000
        : value;
  return new Date(timestamp).toLocaleString("ru-RU");
};

export const AdminUserNotifications = ({
  userId,
}: AdminUserNotificationsProps) => {
  const [offset, setOffset] = React.useState(0);
  const limit = 20;
  const notificationsQuery = useAdminNotificationsQuery({
    userId,
    offset,
    limit,
  });
  const subscriptionsQuery = useAdminSubscriptionsQuery({
    userId,
    offset: 0,
    limit: 100,
  });

  const notifications = notificationsQuery.data?.items ?? [];
  const subscriptions = (subscriptionsQuery.data?.items ?? []).filter(
    (subscription) => subscription.active,
  );

  const notificationsPanel = (
    <Card size="small">
      {notificationsQuery.isLoading ? (
        <Spin />
      ) : notificationsQuery.isError ? (
        <Typography.Text type="danger">
          Не удалось загрузить уведомления пользователя
        </Typography.Text>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Нет уведомлений"
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <div>{item.text}</div>
                    <div
                      style={{
                        display: "grid",
                        gap: 2,
                        color: "#8a8a8a",
                        fontSize: 12,
                      }}
                    >
                      <span>Доставлено: {formatDate(item.created_at)}</span>
                      {item.viewed && item.viewed_at ? (
                        <span>
                          <CheckOutlined
                            style={{ color: "#e40808", marginRight: 4 }}
                            aria-label="Прочитано"
                          />
                          Прочитано: {formatDate(item.viewed_at)}
                        </span>
                      ) : (
                        <span>Не прочитано</span>
                      )}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
      {!notificationsQuery.isError && notificationsQuery.data && (
        <Pagination
          current={Math.floor(offset / limit) + 1}
          pageSize={limit}
          total={
            offset +
            notifications.length +
            (notifications.length === limit ? limit : 0)
          }
          hideOnSinglePage
          onChange={(page) => setOffset((page - 1) * limit)}
        />
      )}
    </Card>
  );

  const subscriptionsPanel = (
    <Card size="small">
      {subscriptionsQuery.isLoading ? (
        <Spin />
      ) : subscriptionsQuery.isError ? (
        <Typography.Text type="danger">
          Не удалось загрузить устройства пользователя
        </Typography.Text>
      ) : subscriptions.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Нет активных устройств"
        />
      ) : (
        <List
          dataSource={subscriptions}
          renderItem={(subscription) => (
            <List.Item>
              <List.Item.Meta
                title={
                  subscription.platform === "web"
                    ? "Web-браузер"
                    : subscription.platform
                }
                description={`Добавлено: ${formatDate(subscription.created_at)}`}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  return (
    <Tabs
      style={{ marginBottom: 24 }}
      items={[
        {
          key: "notifications",
          label: "Уведомления",
          children: notificationsPanel,
        },
        {
          key: "subscriptions",
          label: "Устройства",
          children: subscriptionsPanel,
        },
      ]}
    />
  );
};
