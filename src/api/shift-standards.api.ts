import { apiClient } from "./base";
import type { IShiftStandard } from "../interfaces/shiftStandards/IShiftStandard";

export interface CreateShiftStandardPayload {
  category: number;
  standard: number;
  notification_text?: string;
}

export const fetchShiftStandards = async (): Promise<IShiftStandard[]> => {
  const { data } = await apiClient.get<{
    shift_standards: IShiftStandard[];
  }>("/shift_standards/all", {
    params: { offset: 0, limit: 1000 },
  });
  return data.shift_standards;
};

export const createShiftStandard = async (
  payload: CreateShiftStandardPayload,
): Promise<void> => {
  await apiClient.post("/shift_standards/add", payload);
};

export const updateShiftStandard = async (
  shiftStandardId: string,
  payload: CreateShiftStandardPayload,
): Promise<void> => {
  await apiClient.patch(`/shift_standards/${shiftStandardId}/edit`, payload);
};

export const deleteShiftStandard = async (
  shiftStandardId: string,
): Promise<void> => {
  await apiClient.delete(`/shift_standards/${shiftStandardId}/delete/hard`);
};
