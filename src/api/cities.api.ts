import { apiClient } from "./base";
import type { ICity } from "../interfaces/cities/ICity";
import type { ICitiesList } from "../interfaces/cities/ICitiesList";

export interface EditableCityPayload extends Omit<ICity, "city_id"> {
  password?: string;
}

export const fetchCities = async (): Promise<ICitiesList[]> => {
  const { data } = await apiClient.get<{ cities: ICitiesList[] }>(
    "/cities/all",
  );
  return data.cities;
};

export const fetchCity = async (cityId: string): Promise<ICity> => {
  const { data } = await apiClient.get<{ city: ICity }>(
    `/cities/${cityId}/view`,
  );
  return data.city;
};

export const createCity = async (
  payload: EditableCityPayload,
): Promise<ICity> => {
  const { data } = await apiClient.post<{ city: ICity }>(
    "/cities/add",
    payload,
  );
  return data.city;
};

export const updateCity = async (
  cityId: string,
  payload: EditableCityPayload,
): Promise<ICity> => {
  const { data } = await apiClient.patch<{ city: ICity }>(
    `/cities/${cityId}/edit`,
    payload,
  );
  return data.city;
};

export const deleteCity = async (cityId: string): Promise<void> => {
  await apiClient.patch(`/cities/${cityId}/delete/soft`);
};
