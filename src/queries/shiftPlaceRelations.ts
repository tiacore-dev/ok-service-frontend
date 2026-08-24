import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../queryKeys";
import { addShiftPlaceRelationsBulk, deleteShiftPlaceRelationsBulk, editShiftPlaceRelation, fetchShiftPlaceRelations, type ShiftPlaceRelationBulkPayload } from "../api/shift-place-relations.api";
export const shiftPlaceRelationsKeys = createQueryKeys("shiftPlaceRelations");
export const useShiftPlaceRelationsQuery = () => useQuery({ queryKey: shiftPlaceRelationsKeys.list(), queryFn: fetchShiftPlaceRelations });
export const useAddShiftPlaceRelationsBulkMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: addShiftPlaceRelationsBulk, onSuccess: () => qc.invalidateQueries({ queryKey: shiftPlaceRelationsKeys.list() }) }); };
export const useDeleteShiftPlaceRelationsBulkMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (p: ShiftPlaceRelationBulkPayload) => deleteShiftPlaceRelationsBulk(p), onSuccess: () => qc.invalidateQueries({ queryKey: shiftPlaceRelationsKeys.list() }) }); };
export const useEditShiftPlaceRelationMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: editShiftPlaceRelation, onSuccess: () => qc.invalidateQueries({ queryKey: shiftPlaceRelationsKeys.list() }) }); };
