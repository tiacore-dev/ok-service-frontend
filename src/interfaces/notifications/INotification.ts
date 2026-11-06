export interface INotification {
  notification_id: string;
  title: string;
  body: string;
  route: string | null;
  created_at: number;
  viewed: boolean;
  viewed_at: number | null;
}

export interface INotificationListResponse {
  items: INotification[];
  offset: number;
  limit: number;
}

export type NotificationPlatform = "web";

export interface INotificationSubscription {
  subscription_id: string;
  platform: NotificationPlatform;
  active: boolean;
  created_at: number;
  updated_at: number;
  revoked_at?: number | null;
}

export interface INotificationSubscriptionListResponse {
  items: INotificationSubscription[];
  offset: number;
  limit: number;
}

export interface IRegisterNotificationSubscriptionVariables {
  platform: NotificationPlatform;
  token: string;
}

export interface IAdminNotificationsVariables {
  userId: string;
  offset?: number;
  limit?: number;
}

export interface IAdminSubscriptionsVariables {
  userId: string;
  offset?: number;
  limit?: number;
}

export interface IBulkNotificationVariables {
  recipient_user_ids: string[];
  title: string;
  text: string;
  link?: string;
  idempotency_key: string;
}
