import { BellOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Dropdown,
  Empty,
  List,
  Spin,
  Typography,
  message,
} from "antd";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { requestWebPushToken } from "../../notifications/firebase";
import { subscribeToForegroundMessages } from "../../notifications/firebase";
import {
  useMarkNotificationViewedMutation,
  useNotificationsQuery,
  useRegisterNotificationSubscriptionMutation,
  useUnreadNotificationsCountQuery,
} from "../../queries/notifications";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const notificationsQuery = useNotificationsQuery({ offset: 0, limit: 8 });
  const countQuery = useUnreadNotificationsCountQuery();
  const markViewed = useMarkNotificationViewedMutation();
  const registerSubscription = useRegisterNotificationSubscriptionMutation();
  const [messageApi, messageContextHolder] = message.useMessage();

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void subscribeToForegroundMessages(() => {
      void notificationsQuery.refetch();
      void countQuery.refetch();
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });
    return () => unsubscribe?.();
  }, [countQuery.refetch, notificationsQuery.refetch]);

  const enablePush = async () => {
    try {
      const token = await requestWebPushToken();
      await registerSubscription.mutateAsync({ platform: "web", token });
      messageApi.success("Уведомления включены");
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        return;
      }
      messageApi.error("Уведомления временно недоступны");
    }
  };

  const openNotification = async (
    notification: NonNullable<typeof notificationsQuery.data>["items"][number],
  ) => {
    if (!notification.viewed) {
      try {
        await markViewed.mutateAsync(notification.notification_id);
      } catch {
        return;
      }
    }
    setOpen(false);
    navigate(`/notifications?notification_id=${notification.notification_id}`);
  };

  return (
    <>
      {messageContextHolder}
      <Dropdown
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            void notificationsQuery.refetch();
            void countQuery.refetch();
          }
        }}
        trigger={["click"]}
        placement="bottomRight"
        dropdownRender={() => (
          <div
            style={{
              width: 360,
              maxWidth: "calc(100vw - 32px)",
              background: "#fff",
              padding: 12,
              boxShadow: "0 6px 16px rgba(0,0,0,.15)",
            }}
          >
            <Typography.Text strong>Уведомления</Typography.Text>
            <Button
              type="link"
              onClick={() => void enablePush()}
              loading={registerSubscription.isPending}
            >
              Включить уведомления
            </Button>
            {notificationsQuery.isLoading ? (
              <Spin style={{ display: "block", margin: "24px auto" }} />
            ) : notificationsQuery.isError ? (
              <Typography.Text type="danger">
                Не удалось загрузить уведомления
              </Typography.Text>
            ) : notificationsQuery.data?.items.length ? (
              <List
                size="small"
                dataSource={notificationsQuery.data.items}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      cursor: "pointer",
                      background: item.viewed ? undefined : "#fff5f5",
                    }}
                    onClick={() => void openNotification(item)}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={item.text}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Нет уведомлений"
              />
            )}
            <Button
              type="link"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
            >
              Все уведомления
            </Button>
          </div>
        )}
      >
        <button
          type="button"
          className="header__notification-button"
          aria-label="Уведомления"
          style={{
            width: 32,
            height: 32,
            border: 0,
            background: "transparent",
            color: "inherit",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 20,
            padding: 0,
          }}
        >
          <Badge count={countQuery.data ?? 0} size="small">
            <BellOutlined />
          </Badge>
        </button>
      </Dropdown>
    </>
  );
};
