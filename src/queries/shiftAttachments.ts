import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../queryKeys";
import { deleteShiftAttachment, downloadShiftAttachment, fetchShiftAttachments, uploadShiftAttachments } from "../api/shift-attachments.api";
export const shiftAttachmentsKeys = createQueryKeys("shiftAttachments");
export const useShiftAttachmentsQuery = (shiftId: string) => useQuery({ queryKey: shiftAttachmentsKeys.detail(shiftId), queryFn: () => fetchShiftAttachments(shiftId), enabled: Boolean(shiftId) });
export const useUploadShiftAttachmentsMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: uploadShiftAttachments, onSuccess: (_, v) => qc.invalidateQueries({ queryKey: shiftAttachmentsKeys.detail(v.shiftId) }) }); };
export const useDeleteShiftAttachmentMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: deleteShiftAttachment, onSuccess: (_, v) => qc.invalidateQueries({ queryKey: shiftAttachmentsKeys.detail(v.shiftId) }) }); };
export const useDownloadShiftAttachmentMutation = () => useMutation({ mutationFn: downloadShiftAttachment });
