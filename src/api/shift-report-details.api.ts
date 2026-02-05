import { apiClient } from "./base";

export const fetchShiftReportDetails = async (
  params: Record<string, string>,
) => {
  const { data } = await apiClient.get("/shift_report_details/all", {
    params: { ...params, sort_by: "created_at" },
  });

  return data;
};

export const createShiftReportDetailApi = async (data: any) => {
  const response = await apiClient.post("/shift_report_details/add", data);
  return response.data;
};

export const editShiftReportDetailApi = async (id: string, data: any) => {
  const response = await apiClient.patch(
    `/shift_report_details/${id}/edit`,
    data,
  );
  return response.data;
};

export const deleteShiftReportDetailApi = async (id: string) => {
  const response = await apiClient.delete(
    `/shift_report_details/${id}/delete/hard`,
  );
  return response.data;
};
