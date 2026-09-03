import { apiClient } from "./base";
import type { IAttachment } from "../interfaces/attachments/IAttachment";

export const fetchAcceptanceAttachments = async (
  acceptanceId: string,
): Promise<IAttachment[]> => {
  const { data } = await apiClient.get<{ attachments?: IAttachment[] }>(
    `/acceptances/${acceptanceId}/attachments`,
  );

  return data.attachments ?? [];
};

export const uploadAcceptanceAttachments = async ({
  acceptanceId,
  files,
}: {
  acceptanceId: string;
  files: File[];
}): Promise<IAttachment[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await apiClient.post<{ attachments?: IAttachment[] }>(
    `/acceptances/${acceptanceId}/attachments`,
    formData,
  );

  return data.attachments ?? [];
};

export const deleteAcceptanceAttachment = ({
  acceptanceId,
  attachmentId,
}: {
  acceptanceId: string;
  attachmentId: string;
}) =>
  apiClient.delete(`/acceptances/${acceptanceId}/attachments/${attachmentId}`);

export const downloadAcceptanceAttachment = async ({
  acceptanceId,
  attachmentId,
}: {
  acceptanceId: string;
  attachmentId: string;
}): Promise<Blob> => {
  const response = await apiClient.get(
    `/acceptances/${acceptanceId}/attachments/${attachmentId}/download`,
    { responseType: "blob" },
  );

  return response.data as Blob;
};
