import { apiClient } from "./base";
import type {
  IBulkNotificationVariables,
  INotificationListResponse,
  INotificationSubscriptionListResponse,
  IRegisterNotificationSubscriptionVariables,
  INotificationSubscription,
} from "../interfaces/notifications/INotification";

export const fetchNotifications = async ({
  offset = 0,
  limit = 20,
}: {
  offset?: number;
  limit?: number;
} = {}) => {
  const { data } = await apiClient.get<INotificationListResponse>(
    "/notifications",
    { params: { offset, limit } },
  );
  return data;
};

export const fetchUnreadNotificationsCount = async () => {
  const { data } = await apiClient.get<{ count: number }>(
    "/notifications/unread-count",
  );
  return data.count;
};

export const markNotificationViewed = async (notificationId: string) => {
  const { data } = await apiClient.post<{
    notification_id: string;
    viewed: boolean;
    viewed_at: number | null;
  }>(`/notifications/${notificationId}/view`);
  return data;
};

export const fetchNotificationSubscriptions = async ({
  offset = 0,
  limit = 100,
}: {
  offset?: number;
  limit?: number;
} = {}) => {
  const { data } = await apiClient.get<INotificationSubscriptionListResponse>(
    "/notifications/push/subscriptions",
    { params: { offset, limit } },
  );
  return data;
};

export const registerNotificationSubscription = async (
  payload: IRegisterNotificationSubscriptionVariables,
) => {
  const { data } = await apiClient.put<INotificationSubscription>(
    "/notifications/push/subscription",
    payload,
  );
  return data;
};

export const revokeNotificationSubscription = async (
  subscriptionId: string,
) => {
  await apiClient.delete(`/notifications/push/subscriptions/${subscriptionId}`);
};

export const fetchAdminNotifications = async ({
  userId,
  offset = 0,
  limit = 20,
}: {
  userId: string;
  offset?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get<INotificationListResponse>(
    `/notifications/admin/users/${userId}`,
    { params: { offset, limit } },
  );
  return data;
};

export const fetchAdminSubscriptions = async ({
  userId,
  offset = 0,
  limit = 100,
}: {
  userId: string;
  offset?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get<INotificationSubscriptionListResponse>(
    `/notifications/admin/users/${userId}/push/subscriptions`,
    { params: { offset, limit } },
  );
  return data;
};

export const sendBulkNotification = async (
  payload: IBulkNotificationVariables,
) => {
  const { data } = await apiClient.post<{
    notification_id: string;
    recipient_count: number;
    created_at: number;
    replayed: boolean;
  }>("/notifications/admin/bulk", payload);
  return data;
};
