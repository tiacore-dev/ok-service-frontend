import axios from "axios";
import { authlogout, refreshToken } from "../store/modules/auth";
import { ExportExcelTemplate } from "../pages/shift-reports/components/downloadShiftReportsWithDetails";
import { store } from "../store/appStore"; // Импортируем store для доступа к токенам

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface GenerateDocumentParams {
  file_name: string;
  document_data: ExportExcelTemplate;
  name: string;
}

export const generateDocument = async (
  documentData: ExportExcelTemplate,
  name: string
) => {
  try {
    const { access_token, refresh_token } = store.getState().auth;
    const payload: GenerateDocumentParams = {
      file_name: "shift_report_detail_report_new.xlsx", //имя шаблона который используем, shift_report_detail_report_new.xlsx-для зарплатных вед.
      document_data: documentData,
      name: name,
    };

    // Первая попытка запроса
    let response = await axiosInstance.post("/templates/generate", payload, {
      responseType: "blob",
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
        })
      );

      // Повторяем запрос с новым токеном
      response = await axiosInstance.post("/templates/generate", payload, {
        responseType: "blob",
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
