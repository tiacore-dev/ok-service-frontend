import { apiClient } from "./base";
import type { IPositionsList } from "../interfaces/positions/IPositionsList";

export interface EditablePositionPayload {
  name: string;
}

export const fetchPositions = async (): Promise<IPositionsList[]> => {
  const { data } = await apiClient.get<{ positions: IPositionsList[] }>(
    "/positions/all",
  );
  return data.positions ?? [];
};

export const createPosition = async (
  payload: EditablePositionPayload,
): Promise<void> => {
  await apiClient.post("/positions/add", payload);
};

export const updatePosition = async (
  positionId: string,
  payload: EditablePositionPayload,
): Promise<void> => {
  await apiClient.patch(`/positions/${positionId}/edit`, payload);
};

export const deletePosition = async (positionId: string): Promise<void> => {
  await apiClient.delete(`/positions/${positionId}/delete/hard`);
};
