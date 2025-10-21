import axios, {
  AxiosError,
  AxiosResponse,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { store } from "../store/appStore";
import { authlogout, refreshToken } from "../store/modules/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

type RequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface FailedRequest {
  reject: (error: unknown) => void;
  resolve: (value?: AxiosResponse) => void;
}

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];

const processQueue = (error?: unknown) => {
  while (failedQueue.length) {
    const { resolve, reject } = failedQueue.shift()!;
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  }
};

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.access_token;
  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RequestConfig | undefined;

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      store.dispatch(authlogout());
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    const { refresh_token } = store.getState().auth;

    if (!refresh_token) {
      store.dispatch(authlogout());
      return Promise.reject(error);
    }

    try {
      isRefreshing = true;
      originalRequest._retry = true;

      const refreshResponse = await refreshClient.post("/auth/refresh", {
        refresh_token,
      });

      const { access_token, refresh_token: nextRefreshToken } =
        refreshResponse.data;

      store.dispatch(
        refreshToken({
          access_token,
          refresh_token: nextRefreshToken,
        }),
      );

      const headers = AxiosHeaders.from(originalRequest.headers ?? {});
      headers.set("Authorization", `Bearer ${access_token}`);
      originalRequest.headers = headers;

      processQueue();

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      store.dispatch(authlogout());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { apiClient };
