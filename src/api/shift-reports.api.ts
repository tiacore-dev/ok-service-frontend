import axios from "axios";
import {
  IShiftReport,
  IShiftReportQueryParams,
  ShiftReportApiResponse,
} from "../interfaces/shiftReports/IShiftReport";
import { store } from "../store/appStore"; // Импортируем store для доступа к токенам
import { authlogout, refreshToken } from "../store/modules/auth";

// Создаем экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface CreateShiftReportResponse {
  shift_report_id: string;
}

export const fetchShiftReports = async (
  queryParams: IShiftReportQueryParams,
) => {
  try {
    // Получаем текущее состояние auth из store
    const { access_token, refresh_token } = store.getState().auth;
    const params = {
      ...Object.fromEntries(
        Object.entries(queryParams).filter(([_, value]) => value !== undefined),
      ),
    };
    // Первая попытка запроса
    let response = await axiosInstance.get("/shift_reports/all", {
      params,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    // Если получили 401, пробуем обновить токен
    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });
      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }
      // Обновляем токены в store
      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );
      // Повторяем запрос с новым токеном
      response = await axiosInstance.get("/shift_reports/all", {
        params,
        headers: {
          Authorization: `Bearer ${newTokenResponse.data.access_token}`,
        },
      });
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const fetchShiftReport = async (
  report_id: string,
): Promise<IShiftReport> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.get<ShiftReportApiResponse>(
      `/shift_reports/${report_id}/view`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.get<ShiftReportApiResponse>(
        `/shift_reports/${report_id}/view`,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data.shift_report;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const hardDeleteShiftReport = async (
  report_id: string,
): Promise<void> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.delete(
      `/shift_reports/${report_id}/delete/hard`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.delete(
        `/shift_reports/${report_id}/delete/hard`,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const createShiftReport = async (
  createbleShiftReportData: Omit<IShiftReport, "shift_report_id" | "number">,
): Promise<CreateShiftReportResponse> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.post<CreateShiftReportResponse>(
      "/shift_reports/add",
      createbleShiftReportData,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.post<CreateShiftReportResponse>(
        "/shift_reports/add",
        createbleShiftReportData,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const editShiftReport = async (
  shift_report_id: string,
  editableShiftReportData: Omit<IShiftReport, "shift_report_id" | "number">,
): Promise<{ shift_report_id: string }> => {
  try {
    const { access_token, refresh_token } = store.getState().auth;

    let response = await axiosInstance.patch<{ shift_report_id: string }>(
      `/shift_reports/${shift_report_id}/edit`,
      editableShiftReportData,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (response.status === 401) {
      const newTokenResponse = await axiosInstance.post("/auth/refresh", {
        refresh_token,
      });

      if (newTokenResponse.status !== 200) {
        store.dispatch(authlogout());
        throw new Error("Failed to refresh token");
      }

      store.dispatch(
        refreshToken({
          access_token: newTokenResponse.data.access_token,
          refresh_token: newTokenResponse.data.refresh_token,
        }),
      );

      response = await axiosInstance.patch<{ shift_report_id: string }>(
        `/shift_reports/${shift_report_id}/edit`,
        editableShiftReportData,
        {
          headers: {
            Authorization: `Bearer ${newTokenResponse.data.access_token}`,
          },
        },
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        store.dispatch(authlogout());
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};
