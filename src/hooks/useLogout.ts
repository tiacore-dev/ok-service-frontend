import { notification } from "antd";
import axios from "axios";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth.api";
import { IState } from "../store/modules";
import { authlogout } from "../store/modules/auth";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useSelector((state: IState) => state.auth.access_token);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const clearLocalAuth = React.useCallback(() => {
    dispatch(authlogout());
    queryClient.clear();
    navigate("/login", { replace: true });
  }, [dispatch, navigate, queryClient]);

  const performLogout = React.useCallback(async () => {
    if (isLoggingOut) return;

    if (!accessToken) {
      clearLocalAuth();
      return;
    }

    setIsLoggingOut(true);
    try {
      // The request interceptor attaches the current access JWT. Do not clear
      // it before this request: the server needs it to revoke the session.
      await logout();
      clearLocalAuth();
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      if (status === 401) {
        notification.info({
          message: "Сессия уже завершена",
          description: "Войдите в систему снова.",
        });
        clearLocalAuth();
      } else if (status === 503) {
        notification.error({
          message: "Сервис авторизации временно недоступен",
          description: "Выход не подтверждён. Повторите попытку позже.",
        });
      } else if (!status) {
        notification.error({
          message: "Не удалось завершить сессию",
          description:
            "Нет соединения с сервером. Токены сохранены, попробуйте выйти ещё раз.",
        });
      } else {
        notification.error({
          message: "Не удалось завершить сессию",
          description: "Повторите попытку позже.",
        });
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [accessToken, clearLocalAuth, isLoggingOut]);

  return { logout: performLogout, isLoggingOut };
};
