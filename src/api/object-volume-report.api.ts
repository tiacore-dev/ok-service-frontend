import axios from "axios";
import { authlogout, refreshToken } from "../store/modules/auth";
import type { IObjectVolumeReport } from "../interfaces/reports/IObjectVolumeReport";
import { store } from "../store/appStore";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface GenerateObjectReportParams {
  file_name: string;
  document_data: IObjectVolumeReport;
  name: string;
}

export const generateObjectVolumeReport = async (
  documentData: IObjectVolumeReport,
  name: string
) => {
  try {
    const { access_token, refresh_token } = store.getState().auth;
    const payload: GenerateObjectReportParams = {
      file_name: "template_objects.xlsx", // имя шаблона для отчета по объектам
      document_data: documentData,
      name: name,
    };

    // Первая попытка запроса
    const response = await axiosInstance.post("/templates/generate", payload, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          const { refresh_token } = store.getState().auth;
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
            })
          );

          // Повторяем запрос с новым токеном
          const payload: GenerateObjectReportParams = {
            file_name: "template_objects.xlsx",
            document_data: documentData,
            name: name,
          };

          const retryResponse = await axiosInstance.post(
            "/templates/generate",
            payload,
            {
              responseType: "blob",
              headers: {
                Authorization: `Bearer ${newTokenResponse.data.access_token}`,
              },
            }
          );

          return retryResponse.data;
        } catch (refreshError) {
          store.dispatch(authlogout());
          throw new Error("Authentication failed");
        }
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};
