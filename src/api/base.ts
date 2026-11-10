import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { notification } from "antd";
import { store } from "../store/appStore";
import { authlogout, refreshToken } from "../store/modules/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type RequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _accessToken?: string;
};

const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"];
const AUTH_STATE_CHANGED = "Authentication state changed during refresh";
const INVALID_REFRESH_RESPONSE = "Invalid refresh response";

let refreshPromise: Promise<string> | null = null;

const isAuthEndpoint = (url?: string) =>
  AUTH_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

const isRefreshResponse = (
  data: unknown,
): data is { access_token: string; refresh_token: string } => {
  if (!data || typeof data !== "object") return false;

  const tokens = data as Record<string, unknown>;
  return (
    typeof tokens.access_token === "string" &&
    tokens.access_token.length > 0 &&
    typeof tokens.refresh_token === "string" &&
    tokens.refresh_token.length > 0
  );
};

const notifyAuthUnavailable = () => {
  notification.error({
    message: "Сервис авторизации временно недоступен",
    description: "Повторите действие позже. Текущая сессия сохранена.",
  });
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshTokenValue = store.getState().auth.refresh_token;

  if (!refreshTokenValue) {
    store.dispatch(authlogout());
    throw new Error("Refresh token is missing");
  }

  try {
    const refreshResponse = await refreshClient.post("/auth/refresh", {
      refresh_token: refreshTokenValue,
    });

    if (!isRefreshResponse(refreshResponse.data)) {
      notification.error({
        message: "Не удалось обновить сессию",
        description: "Сервис авторизации вернул некорректный ответ.",
      });
      throw new Error(INVALID_REFRESH_RESPONSE);
    }

    // A logout or a new login can happen while the request is pending. A late
    // response must never overwrite tokens belonging to the newer auth state.
    if (store.getState().auth.refresh_token !== refreshTokenValue) {
      throw new Error(AUTH_STATE_CHANGED);
    }

    store.dispatch(
      refreshToken({
        access_token: refreshResponse.data.access_token,
        refresh_token: refreshResponse.data.refresh_token,
      }),
    );

    return refreshResponse.data.access_token;
  } catch (error) {
    if (
      error instanceof Error &&
      [AUTH_STATE_CHANGED, INVALID_REFRESH_RESPONSE].includes(error.message)
    ) {
      throw error;
    }

    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    const sameAuthState =
      store.getState().auth.refresh_token === refreshTokenValue;

    if (status === 401 && sameAuthState) {
      // Refresh tokens without session_id and revoked refresh tokens are no
      // longer usable. Clear them once and let the app route to login.
      store.dispatch(authlogout());
    } else if (status === 503) {
      notifyAuthUnavailable();
    } else if (!status) {
      notification.error({
        message: "Не удалось обновить сессию",
        description: "Проверьте подключение к интернету и повторите попытку.",
      });
    }

    throw error;
  }
};

const getRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.access_token;
  if (
    token &&
    !config.url?.includes("/auth/login") &&
    !config.url?.includes("/auth/refresh")
  ) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
    (config as RequestConfig)._accessToken = token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RequestConfig | undefined;

    const responseMessage =
      error.response?.data && typeof error.response.data === "object"
        ? (error.response.data as { msg?: unknown }).msg
        : undefined;
    if (status === 401 && responseMessage === "Browser identity is required") {
      return Promise.reject(error);
    }

    if (
      !originalRequest ||
      status !== 401 ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      store.dispatch(authlogout());
      return Promise.reject(error);
    }

    const { access_token, refresh_token } = store.getState().auth;

    if (!refresh_token) {
      store.dispatch(authlogout());
      return Promise.reject(error);
    }

    // A response for an access token that was already rotated must not start a
    // second refresh (which would reuse the previous refresh token).
    if (
      originalRequest._accessToken &&
      access_token !== originalRequest._accessToken
    ) {
      originalRequest._retry = true;
      return apiClient(originalRequest);
    }

    try {
      originalRequest._retry = true;
      await getRefreshPromise();
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export { apiClient };
