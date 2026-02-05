import { apiClient } from "./base";
import type { IShiftReportMaterial } from "../interfaces/shiftReportMaterials/IShiftReportMaterial";
import type { IShiftReportMaterialsList } from "../interfaces/shiftReportMaterials/IShiftReportMaterialsList";

export interface EditableShiftReportMaterialPayload
  extends Omit<
    IShiftReportMaterial,
    "shift_report_material_id" | "created_at" | "created_by"
  > {}

export const fetchShiftReportMaterials = async (
  params: Record<string, string>,
): Promise<{ shift_report_materials: IShiftReportMaterialsList[] }> => {
  const { data } = await apiClient.get("/shift_report_materials/all", {
    params: { ...params, sort_by: "created_at" },
  });

  return data;
};

export const createShiftReportMaterialApi = async (
  data: EditableShiftReportMaterialPayload,
): Promise<IShiftReportMaterial> => {
  const response = await apiClient.post("/shift_report_materials/add", data);
  return response.data.shift_report_material ?? response.data;
};

export const editShiftReportMaterialApi = async (
  id: string,
  data: EditableShiftReportMaterialPayload,
): Promise<IShiftReportMaterial> => {
  const response = await apiClient.patch(
    `/shift_report_materials/${id}/edit`,
    data,
  );
  return response.data.shift_report_material ?? response.data;
};

export const deleteShiftReportMaterialApi = async (
  id: string,
): Promise<void> => {
  await apiClient.delete(`/shift_report_materials/${id}/delete/hard`);
};
