import { apiClient } from "./base";
import type { IProjectMaterial } from "../interfaces/projectMaterials/IProjectMaterial";
import type { IProjectMaterialsList } from "../interfaces/projectMaterials/IProjectMaterialsList";

export interface EditableProjectMaterialPayload
  extends Omit<
    IProjectMaterial,
    "project_material_id" | "created_at" | "created_by"
  > {}

export const fetchProjectMaterials = async (
  params: Record<string, string> = {},
): Promise<IProjectMaterialsList[]> => {
  const { data } = await apiClient.get<{
    project_materials: IProjectMaterialsList[];
  }>("/project_materials/all", {
    params,
  });
  return data.project_materials;
};

export const fetchAllProjectMaterials = async (
  params: Record<string, string> = {},
): Promise<IProjectMaterialsList[]> => {
  const pageSize = 1000;
  const materials: IProjectMaterialsList[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await fetchProjectMaterials({
      ...params,
      offset: String(offset),
      limit: String(pageSize),
    });
    materials.push(...page);
    if (page.length < pageSize) return materials;
  }
};

export const createProjectMaterial = async (
  payload: EditableProjectMaterialPayload,
): Promise<IProjectMaterial> => {
  const { data } = await apiClient.post<{ project_material: IProjectMaterial }>(
    "/project_materials/add",
    payload,
  );
  return data.project_material;
};

export const updateProjectMaterial = async (
  projectMaterialId: string,
  payload: EditableProjectMaterialPayload,
): Promise<IProjectMaterial> => {
  const { data } = await apiClient.patch<{
    project_material: IProjectMaterial;
  }>(`/project_materials/${projectMaterialId}/edit`, payload);
  return data.project_material;
};

export const deleteProjectMaterial = async (
  projectMaterialId: string,
): Promise<void> => {
  await apiClient.delete(`/project_materials/${projectMaterialId}/delete/hard`);
};
