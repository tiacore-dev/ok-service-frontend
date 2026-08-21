import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePlaceAttachment,
  downloadPlaceAttachment,
  fetchPlaceAttachments,
  uploadPlaceAttachment,
} from "../api/place-attachments.api";
import { createQueryKeys } from "../queryKeys";

export const placeAttachmentsKeys = createQueryKeys("placeAttachments");

export const usePlaceAttachmentsQuery = (placeId: string) =>
  useQuery({
    queryKey: placeAttachmentsKeys.detail(placeId),
    queryFn: () => fetchPlaceAttachments(placeId),
    enabled: Boolean(placeId),
  });

export const useUploadPlaceAttachmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadPlaceAttachment,
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: placeAttachmentsKeys.detail(variables.placeId),
      }),
  });
};

export const useDeletePlaceAttachmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlaceAttachment,
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: placeAttachmentsKeys.detail(variables.placeId),
      }),
  });
};

export const useDownloadPlaceAttachmentMutation = () =>
  useMutation({ mutationFn: downloadPlaceAttachment });
