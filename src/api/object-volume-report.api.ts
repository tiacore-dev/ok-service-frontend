import { apiClient } from "./base";
import type { IObjectVolumeReport } from "../interfaces/reports/IObjectVolumeReport";

interface GenerateObjectReportParams {
  file_name: string;
  document_data: IObjectVolumeReport;
  name: string;
}

export const generateObjectVolumeReport = async (
  documentData: IObjectVolumeReport,
  name: string,
) => {
  const payload: GenerateObjectReportParams = {
    file_name: "template_objects.xlsx", // имя шаблона для отчета по объектам template_objects.xlsx
    document_data: documentData,
    name: name,
  };

  const { data } = await apiClient.post("/templates/generate", payload, {
    responseType: "blob",
  });

  return data;
};
