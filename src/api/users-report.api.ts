import { apiClient } from "./base";
import { IUsersReport } from "../interfaces/reports/IUsersReport";

interface GenerateObjectReportParams {
  file_name: string;
  document_data: IUsersReport;
  name: string;
}

export const generateUsersReport = async (
  documentData: IUsersReport,
  name: string,
) => {
  const payload: GenerateObjectReportParams = {
    file_name: "template_users.xlsx", // имя шаблона для отчета по объектам template_users.xlsx
    document_data: documentData,
    name: name,
  };

  const { data } = await apiClient.post("/templates/generate", payload, {
    responseType: "blob",
  });

  return data;
};
