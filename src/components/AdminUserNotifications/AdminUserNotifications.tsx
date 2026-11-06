import { Card, Empty, List, Pagination, Spin, Typography } from "antd";
import * as React from "react";
import {
  useAdminNotificationsQuery,
  useAdminSubscriptionsQuery,
} from "../../queries/notifications";

interface AdminUserNotificationsProps {
  userId: string;
}

const formatDate = (value?: number | null) =>
  value ? new Date(value * 1000).toLocaleString("ru-RU") : "—";

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

  return (
    <>
      <Card title="Уведомления" size="small">
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
                      <div>{item.body}</div>
                      <Typography.Text type="secondary">
                        {formatDate(item.created_at)} ·{" "}
                        {item.viewed ? "Просмотрено" : "Не просмотрено"}
                      </Typography.Text>
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
      <Card title="Устройства" size="small" style={{ marginTop: 16 }}>
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
    </>
  );
};
