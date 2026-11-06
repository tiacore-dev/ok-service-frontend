import { notification } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../queryKeys";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import {
  fetchAdminNotifications,
  fetchAdminSubscriptions,
  fetchNotificationSubscriptions,
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markNotificationViewed,
  registerNotificationSubscription,
  revokeNotificationSubscription,
  sendBulkNotification,
} from "../api/notifications.api";
import type {
  IAdminNotificationsVariables,
  IAdminSubscriptionsVariables,
  IBulkNotificationVariables,
  IRegisterNotificationSubscriptionVariables,
} from "../interfaces/notifications/INotification";

export const notificationsKeys = createQueryKeys("notifications");
export const notificationSubscriptionsKeys = createQueryKeys(
  "notificationSubscriptions",
);

const showError = (error: unknown, fallback: string) =>
  notification.error({
    message: "Ошибка уведомлений",
    description: getApiErrorMessage(error, fallback),
  });

export const useNotificationsQuery = (params?: {
  offset?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => fetchNotifications(params),
  });

export const useUnreadNotificationsCountQuery = () =>
  useQuery({
    queryKey: notificationsKeys.detail("unread-count"),
    queryFn: fetchUnreadNotificationsCount,
  });

export const useNotificationSubscriptionsQuery = () =>
  useQuery({
    queryKey: notificationSubscriptionsKeys.list(),
    queryFn: () => fetchNotificationSubscriptions(),
  });

export const useAdminNotificationsQuery = (
  params: IAdminNotificationsVariables,
  enabled = true,
) =>
  useQuery({
    queryKey: notificationsKeys.detail(
      `admin:${params.userId}:${params.offset ?? 0}:${params.limit ?? 20}`,
    ),
    queryFn: () => fetchAdminNotifications(params),
    enabled: enabled && Boolean(params.userId),
  });

export const useAdminSubscriptionsQuery = (
  params: IAdminSubscriptionsVariables,
  enabled = true,
) =>
  useQuery({
    queryKey: notificationSubscriptionsKeys.detail(
      `admin:${params.userId}:${params.offset ?? 0}:${params.limit ?? 100}`,
    ),
    queryFn: () => fetchAdminSubscriptions(params),
    enabled: enabled && Boolean(params.userId),
  });

export const useMarkNotificationViewedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationViewed,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all() });
    },
    onError: (error) =>
      showError(error, "Не удалось отметить уведомление просмотренным"),
  });
};

export const useRegisterNotificationSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IRegisterNotificationSubscriptionVariables) =>
      registerNotificationSubscription(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationSubscriptionsKeys.all(),
      });
    },
    onError: (error) =>
      showError(error, "Не удалось зарегистрировать устройство"),
  });
};

export const useRevokeNotificationSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeNotificationSubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationSubscriptionsKeys.all(),
      });
    },
    onError: (error) => showError(error, "Не удалось отключить устройство"),
  });
};

export const useSendBulkNotificationMutation = () =>
  useMutation({
    mutationFn: (payload: IBulkNotificationVariables) =>
      sendBulkNotification(payload),
    onError: (error) => showError(error, "Не удалось отправить уведомление"),
  });
