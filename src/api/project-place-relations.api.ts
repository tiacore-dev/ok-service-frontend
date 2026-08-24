import { apiClient } from "./base";
import type { IProjectPlaceRelation } from "../interfaces/projectPlaceRelations/IProjectPlaceRelation";

export interface ProjectPlaceRelationsBulkPayload {
  project_id: string;
  place_ids: string[];
}

export const fetchProjectPlaceRelations = async (): Promise<
  IProjectPlaceRelation[]
> => {
  const { data } = await apiClient.get<{
    project_place_relations: IProjectPlaceRelation[];
  }>("/project_place_relations/all");
  return data.project_place_relations;
};

export const addProjectPlaceRelations = async (
  payload: ProjectPlaceRelationsBulkPayload,
): Promise<void> => {
  await apiClient.post("/project_place_relations/add-bulk", payload);
};

export const deleteProjectPlaceRelations = async (
  payload: ProjectPlaceRelationsBulkPayload,
): Promise<void> => {
  await apiClient.delete("/project_place_relations/delete-bulk", {
    data: payload,
  });
};

export const deleteProjectPlaceRelation = async (relationId: string): Promise<void> => {
  await apiClient.delete(`/project_place_relations/${relationId}/delete/hard`);
};
