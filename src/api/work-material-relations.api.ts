import { apiClient } from "./base";
import type { IWorkMaterialRelation } from "../interfaces/workMaterialRelations/IWorkMaterialRelation";
import type { IWorkMaterialRelationsList } from "../interfaces/workMaterialRelations/IWorkMaterialRelationsList";

export interface EditableWorkMaterialRelationPayload
  extends Omit<
    IWorkMaterialRelation,
    "work_material_relation_id" | "created_at" | "created_by"
  > {}

export const fetchWorkMaterialRelations = async (
  params: Record<string, string> = {},
): Promise<IWorkMaterialRelationsList[]> => {
  const { data } = await apiClient.get<{
    work_material_relations: IWorkMaterialRelationsList[];
  }>("/work_material_relations/all", {
    params,
  });
  return data.work_material_relations;
};

export const createWorkMaterialRelation = async (
  payload: EditableWorkMaterialRelationPayload,
): Promise<IWorkMaterialRelation> => {
  const { data } = await apiClient.post<{
    work_material_relation: IWorkMaterialRelation;
  }>("/work_material_relations/add", payload);
  return data.work_material_relation;
};

export const updateWorkMaterialRelation = async (
  relationId: string,
  payload: EditableWorkMaterialRelationPayload,
): Promise<IWorkMaterialRelation> => {
  const { data } = await apiClient.patch<{
    work_material_relation: IWorkMaterialRelation;
  }>(`/work_material_relations/${relationId}/edit`, payload);
  return data.work_material_relation;
};

export const deleteWorkMaterialRelation = async (
  relationId: string,
): Promise<void> => {
  await apiClient.delete(`/work_material_relations/${relationId}/delete/hard`);
};
