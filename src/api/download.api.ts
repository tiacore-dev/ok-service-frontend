import { apiClient } from "./base";
import { ExportExcelTemplate } from "../pages/shift-reports/components/export/useDownloadShiftReportsWithDetails";

interface GenerateDocumentParams {
  file_name: string;
  document_data: ExportExcelTemplate;
  name: string;
}

export const generateDocument = async (
  documentData: ExportExcelTemplate,
  name: string,
) => {
  const payload: GenerateDocumentParams = {
    file_name: "shift_report_detail_report_new.xlsx", //имя шаблона который используем, shift_report_detail_report_new.xlsx-для зарплатных вед.
    document_data: documentData,
    name: name,
  };

  const { data } = await apiClient.post("/templates/generate", payload, {
    responseType: "blob",
  });

  return data;
};
