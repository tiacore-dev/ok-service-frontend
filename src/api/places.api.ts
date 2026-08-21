import { apiClient } from "./base";
import type { IPlace } from "../interfaces/places/IPlace";

export interface PlacePayload {
  object_id?: string;
  name: string;
  description?: string;
}

export const fetchPlaces = async (): Promise<IPlace[]> => {
  const { data } = await apiClient.get<{ places: IPlace[] }>("/places/all");
  return data.places;
};

export const createPlace = async (payload: PlacePayload): Promise<void> => {
  await apiClient.post("/places/add", payload);
};

export const updatePlace = async (
  placeId: string,
  payload: PlacePayload,
): Promise<void> => {
  await apiClient.patch(`/places/${placeId}/edit`, payload);
};

export const deletePlace = async (placeId: string): Promise<void> => {
  await apiClient.patch(`/places/${placeId}/delete/soft`);
};
