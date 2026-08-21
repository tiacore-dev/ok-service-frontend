import { apiClient } from "./base";
import type { IAttachment } from "../interfaces/attachments/IAttachment";

export const fetchPlaceAttachments = async (
  placeId: string,
): Promise<IAttachment[]> => {
  const { data } = await apiClient.get<{ attachments?: IAttachment[] }>(
    `/places/${placeId}/attachments`,
  );
  return data.attachments ?? [];
};

export const uploadPlaceAttachment = async ({
  placeId,
  file,
}: {
  placeId: string;
  file: File;
}) => {
  const form = new FormData();
  form.append("files", file);
  const { data } = await apiClient.post<{ attachments?: IAttachment[] }>(
    `/places/${placeId}/attachments`,
    form,
  );
  return data.attachments ?? [];
};

export const deletePlaceAttachment = ({
  placeId,
  attachmentId,
}: {
  placeId: string;
  attachmentId: string;
}) => apiClient.delete(`/places/${placeId}/attachments/${attachmentId}`);

export const downloadPlaceAttachment = async ({
  placeId,
  attachmentId,
}: {
  placeId: string;
  attachmentId: string;
}) => {
  const response = await apiClient.get(
    `/places/${placeId}/attachments/${attachmentId}/download`,
    { responseType: "blob" },
  );
  return response.data as Blob;
};
