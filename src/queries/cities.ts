import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createCity,
  deleteCity,
  fetchCity,
  fetchCities,
  updateCity,
  type EditableCityPayload,
} from "../api/cities.api";
import type { ICity } from "../interfaces/cities/ICity";
import type { ICitiesList } from "../interfaces/cities/ICitiesList";
import { createQueryKeys } from "../queryKeys";

export const citiesKeys = createQueryKeys("cities");

type CitiesQueryOptions<TData> = Omit<
  UseQueryOptions<ICitiesList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useCitiesQuery = <TData = ICitiesList[]>(
  options?: CitiesQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: citiesKeys.list(),
    queryFn: fetchCities,
    ...options,
  });

type CityQueryOptions<TData> = Omit<
  UseQueryOptions<ICity, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useCityQuery = <TData = ICity>(
  cityId: string | undefined,
  options?: CityQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(cityId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: citiesKeys.detail(cityId ?? "unknown"),
    queryFn: () => fetchCity(cityId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useCitiesMap = (
  options?: CitiesQueryOptions<ICitiesList[]>,
): UseQueryResult<ICitiesList[], Error> & {
  cities: ICitiesList[];
  citiesMap: Record<string, ICity>;
  cityOptions: {
    label: string;
    text: string;
    value: string;
  }[];
} => {
  const query = useCitiesQuery(options);
  const cities = query.data ?? [];

  const citiesMap = useMemo(() => {
    return cities.reduce<Record<string, ICity>>((acc, city) => {
      acc[city.city_id] = city;
      return acc;
    }, {});
  }, [cities]);

  const cityOptions = Object.values(cities)
    .filter((city) => !city.deleted)
    .map((city) => ({
      label: city.name,
      text: city.name,
      value: city.city_id,
    }));

  return { ...query, cities, citiesMap, cityOptions };
};

export interface UpdateCityVariables {
  cityId: string;
  payload: EditableCityPayload;
}

export const useCreateCityMutation = (): UseMutationResult<
  ICity,
  Error,
  EditableCityPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: citiesKeys.list() });
    },
  });
};

export const useUpdateCityMutation = (): UseMutationResult<
  ICity,
  Error,
  UpdateCityVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cityId, payload }) => updateCity(cityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: citiesKeys.list() });
      queryClient.invalidateQueries({
        queryKey: citiesKeys.detail(variables.cityId),
      });
    },
  });
};

export const useDeleteCityMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cityId) => deleteCity(cityId),
    onSuccess: (_, cityId) => {
      queryClient.invalidateQueries({ queryKey: citiesKeys.list() });
      queryClient.removeQueries({ queryKey: citiesKeys.detail(cityId) });
    },
  });
};

export type { EditableCityPayload };
