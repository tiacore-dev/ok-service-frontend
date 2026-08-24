import { apiClient } from "./base";
import type { IShiftPlaceRelation } from "../interfaces/shiftPlaceRelations/IShiftPlaceRelation";

export interface ShiftPlaceRelationBulkPayload { shift_report_id: string; place_ids: string[]; }
export interface ShiftPlaceRelationCreatePayload { shift_report_id: string; place_id: string; comment?: string; }
export interface ShiftPlaceRelationEditPayload { place_id?: string; comment?: string; }

export const fetchShiftPlaceRelations = async (): Promise<IShiftPlaceRelation[]> => {
  const { data } = await apiClient.get<{ shift_place_relations?: IShiftPlaceRelation[] }>("/shift_place_relations/all");
  return data.shift_place_relations ?? [];
};
export const addShiftPlaceRelationsBulk = async (payload: ShiftPlaceRelationBulkPayload) => {
  const { data } = await apiClient.post<{ shift_place_relations?: IShiftPlaceRelation[] }>("/shift_place_relations/add-bulk", payload);
  return data.shift_place_relations ?? [];
};
export const deleteShiftPlaceRelationsBulk = (payload: ShiftPlaceRelationBulkPayload) => apiClient.delete("/shift_place_relations/delete-bulk", { data: payload });
export const editShiftPlaceRelation = ({ relationId, payload }: { relationId: string; payload: ShiftPlaceRelationEditPayload }) => apiClient.patch(`/shift_place_relations/${relationId}/edit`, payload);
