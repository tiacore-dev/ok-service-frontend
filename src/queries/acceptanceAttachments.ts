import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../queryKeys";
import {
  deleteAcceptanceAttachment,
  downloadAcceptanceAttachment,
  fetchAcceptanceAttachments,
  uploadAcceptanceAttachments,
} from "../api/acceptance-attachments.api";

export const acceptanceAttachmentsKeys = createQueryKeys(
  "acceptanceAttachments",
);

export const useAcceptanceAttachmentsQuery = (acceptanceId: string) =>
  useQuery({
    queryKey: acceptanceAttachmentsKeys.detail(acceptanceId),
    queryFn: () => fetchAcceptanceAttachments(acceptanceId),
    enabled: Boolean(acceptanceId),
  });

export const useUploadAcceptanceAttachmentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAcceptanceAttachments,
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: acceptanceAttachmentsKeys.detail(variables.acceptanceId),
      }),
  });
};

export const useDeleteAcceptanceAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAcceptanceAttachment,
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: acceptanceAttachmentsKeys.detail(variables.acceptanceId),
      }),
  });
};

export const useDownloadAcceptanceAttachmentMutation = () =>
  useMutation({ mutationFn: downloadAcceptanceAttachment });
