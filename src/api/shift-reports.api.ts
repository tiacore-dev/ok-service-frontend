import {
  IShiftReport,
  IShiftReportQueryParams,
  ShiftReportApiResponse,
} from "../interfaces/shiftReports/IShiftReport";
import { apiClient } from "./base";

interface CreateShiftReportResponse {
  shift_report_id: string;
}

export const fetchShiftReports = async (
  queryParams: IShiftReportQueryParams,
) => {
  const params = Object.entries(queryParams)
    .filter(([, value]) => value !== undefined && value !== null)
    .reduce<Record<string, string | number>>((acc, [key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          acc[key] = value.join(",");
        }
      } else {
        acc[key] = value as string | number;
      }
      return acc;
    }, {});

  const { data } = await apiClient.get("/shift_reports/all", { params });
  return data;
};

export const fetchShiftReport = async (
  report_id: string,
): Promise<IShiftReport> => {
  const { data } = await apiClient.get<ShiftReportApiResponse>(
    `/shift_reports/${report_id}/view`,
  );

  return data.shift_report;
};

export const hardDeleteShiftReport = async (
  report_id: string,
): Promise<void> => {
  await apiClient.delete(`/shift_reports/${report_id}/delete/hard`);
};

export const createShiftReport = async (
  createbleShiftReportData: Omit<IShiftReport, "shift_report_id" | "number">,
): Promise<CreateShiftReportResponse> => {
  const { data } = await apiClient.post<CreateShiftReportResponse>(
    "/shift_reports/add",
    createbleShiftReportData,
  );

  return data;
};

export const editShiftReport = async (
  shift_report_id: string,
  editableShiftReportData: Omit<IShiftReport, "shift_report_id" | "number">,
): Promise<{ shift_report_id: string }> => {
  const { data } = await apiClient.patch<{ shift_report_id: string }>(
    `/shift_reports/${shift_report_id}/edit`,
    editableShiftReportData,
  );

  return data;
};
