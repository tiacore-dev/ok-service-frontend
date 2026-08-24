import { apiClient } from "./base";
import type { IAttachment } from "../interfaces/attachments/IAttachment";

export const fetchShiftAttachments = async (shiftId: string): Promise<IAttachment[]> => {
  const { data } = await apiClient.get<{ attachments?: IAttachment[] }>(`/shift_reports/${shiftId}/attachments`);
  return data.attachments ?? [];
};
export const uploadShiftAttachments = async ({ shiftId, files }: { shiftId: string; files: File[] }) => {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  const { data } = await apiClient.post<{ attachments?: IAttachment[] }>(`/shift_reports/${shiftId}/attachments`, form);
  return data.attachments ?? [];
};
export const deleteShiftAttachment = ({ shiftId, attachmentId }: { shiftId: string; attachmentId: string }) => apiClient.delete(`/shift_reports/${shiftId}/attachments/${attachmentId}`);
export const downloadShiftAttachment = async ({ shiftId, attachmentId }: { shiftId: string; attachmentId: string }) => {
  const response = await apiClient.get(`/shift_reports/${shiftId}/attachments/${attachmentId}/download`, { responseType: "blob" });
  return response.data as Blob;
};
