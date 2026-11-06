import {
  Alert,
  Button,
  Card,
  Empty,
  List,
  Pagination,
  Skeleton,
  Spin,
  Tabs,
  Typography,
} from "antd";
import { LinkOutlined } from "@ant-design/icons";
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
  const [selectedId, setSelectedId] = React.useState<string>();
  const [openingId, setOpeningId] = React.useState<string>();
  const [openError, setOpenError] = React.useState<string>();
  const limit = 20;
  const notifications = useNotificationsQuery({ offset, limit });
  const subscriptions = useNotificationSubscriptionsQuery();
  const revoke = useRevokeNotificationSubscriptionMutation();
  const markViewed = useMarkNotificationViewedMutation();
  const items = notifications.data?.items ?? [];
  const selected = items.find((item) => item.notification_id === selectedId);

  const formatDate = (value: number | null | undefined) => {
    if (!value) return "—";
    const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(timestamp).toLocaleString("ru-RU");
  };

  const history = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 380px) 1fr",
        gap: 16,
        minHeight: "calc(100vh - 220px)",
      }}
    >
      <Card
        size="small"
        bodyStyle={{
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {notifications.isLoading ? (
          <Spin />
        ) : notifications.isError ? (
          <Alert type="error" message="Не удалось загрузить уведомления" />
        ) : (
          <List
            dataSource={items}
            locale={{ emptyText: <Empty description="Нет уведомлений" /> }}
            renderItem={(item) => (
              <List.Item
                onClick={async () => {
                  setOpenError(undefined);
                  if (!item.viewed) {
                    setOpeningId(item.notification_id);
                    try {
                      await markViewed.mutateAsync(item.notification_id);
                    } catch {
                      setOpenError("Не удалось открыть уведомление");
                      setOpeningId(undefined);
                      return;
                    }
                    setOpeningId(undefined);
                  }
                  setSelectedId(item.notification_id);
                }}
                style={{
                  cursor: "pointer",
                  padding: "14px 16px",
                  background:
                    item.notification_id === selected?.notification_id
                      ? "#fff1f0"
                      : undefined,
                  borderInlineStart: item.viewed
                    ? "3px solid transparent"
                    : "3px solid #ff1616",
                }}
              >
                <List.Item.Meta
                  title={
                    <Typography.Text strong={!item.viewed}>
                      {item.title}
                    </Typography.Text>
                  }
                  description={
                    <>
                      <Typography.Text type="secondary" ellipsis>
                        {item.text}
                      </Typography.Text>
                      <br />
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {formatDate(item.created_at)}
                      </Typography.Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
        <div style={{ padding: "8px 12px 12px", marginTop: "auto" }}>
          <Pagination
            current={offset / limit + 1}
            pageSize={limit}
            total={offset + items.length + (items.length === limit ? limit : 0)}
            onChange={(page) => setOffset((page - 1) * limit)}
            showSizeChanger={false}
            size="small"
          />
        </div>
      </Card>
      <Card size="small" style={{ minHeight: 320 }}>
        {openingId ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : openError ? (
          <Alert type="error" message={openError} />
        ) : selected ? (
          <>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {selected.title}
            </Typography.Title>
            <Typography.Text type="secondary">
              {formatDate(selected.created_at)}
              {selected.viewed_at
                ? ` · Просмотрено ${formatDate(selected.viewed_at)}`
                : ""}
            </Typography.Text>
            <Typography.Paragraph
              style={{ whiteSpace: "pre-wrap", marginTop: 24 }}
            >
              {selected.text}
            </Typography.Paragraph>
            {selected.link && (
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={() => navigate(selected.link as string)}
              >
                Открыть связанную запись
              </Button>
            )}
          </>
        ) : (
          <Empty description="Выберите уведомление" />
        )}
      </Card>
    </div>
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
            children: <div>{history}</div>,
          },
          {
            key: "devices",
            label: "Мои устройства",
            children: <div>{devices}</div>,
          },
        ]}
      />
    </main>
  );
};
