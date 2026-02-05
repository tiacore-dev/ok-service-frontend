import { apiClient } from "./base";
import type { IMaterial } from "../interfaces/materials/IMaterial";
import type { IMaterialsList } from "../interfaces/materials/IMaterialsList";

export interface EditableMaterialPayload
  extends Omit<IMaterial, "material_id" | "created_at" | "created_by"> {}

export const fetchMaterials = async (): Promise<IMaterialsList[]> => {
  const { data } = await apiClient.get<{ materials: IMaterialsList[] }>(
    "/materials/all",
  );
  return data.materials;
};

export const fetchMaterial = async (materialId: string): Promise<IMaterial> => {
  const { data } = await apiClient.get<{ material: IMaterial }>(
    `/materials/${materialId}/view`,
  );
  return data.material;
};

export const createMaterial = async (
  payload: EditableMaterialPayload,
): Promise<IMaterial> => {
  const { data } = await apiClient.post<{ material: IMaterial }>(
    "/materials/add",
    payload,
  );
  return data.material;
};

export const updateMaterial = async (
  materialId: string,
  payload: EditableMaterialPayload,
): Promise<IMaterial> => {
  const { data } = await apiClient.patch<{ material: IMaterial }>(
    `/materials/${materialId}/edit`,
    payload,
  );
  return data.material;
};

export const deleteMaterial = async (materialId: string): Promise<void> => {
  await apiClient.patch(`/materials/${materialId}/delete/soft`);
};

export const hardDeleteMaterial = async (materialId: string): Promise<void> => {
  await apiClient.delete(`/materials/${materialId}/delete/hard`);
};
