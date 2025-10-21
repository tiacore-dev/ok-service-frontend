import React from "react";
import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

export const NotificationContext =
  React.createContext<NotificationInstance>(notification);
