import axios from "axios";
import { authlogout, refreshToken } from "../store/modules/auth";
import { ExportExcelTemplate } from "../pages/shift-reports/components/downloadShiftReportsWithDetails";

const axiosInstance = axios.create({
  baseURL: process.env.TEMPLATE_API_URL,
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
    const payload: GenerateDocumentParams = {
      file_name: "shift_report_detail_report.xlsx",
      document_data: documentData,
      name: name,
    };

    // Добавляем responseType: 'blob' для получения файла
    const response = await axiosInstance.post("/api/docs/generate", payload, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};
