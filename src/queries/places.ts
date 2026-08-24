import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createPlace,
  deletePlace,
  fetchPlaces,
  updatePlace,
  type PlacePayload,
} from "../api/places.api";
import type { IPlace } from "../interfaces/places/IPlace";
import { createQueryKeys } from "../queryKeys";

export const placesKeys = createQueryKeys("places");

type PlacesQueryOptions<TData> = Omit<
  UseQueryOptions<IPlace[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const usePlacesQuery = <TData = IPlace[]>(
  options?: PlacesQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({ queryKey: placesKeys.list(), queryFn: fetchPlaces, ...options });

export interface UpdatePlaceVariables {
  placeId: string;
  payload: PlacePayload;
}

export const useCreatePlaceMutation = (): UseMutationResult<
  void,
  Error,
  PlacePayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKeys.list() });
    },
  });
};

export const useUpdatePlaceMutation = (): UseMutationResult<
  void,
  Error,
  UpdatePlaceVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ placeId, payload }) => updatePlace(placeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: placesKeys.list() });
      queryClient.invalidateQueries({
        queryKey: placesKeys.detail(variables.placeId),
      });
    },
  });
};

export const useDeletePlaceMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlace,
    onSuccess: (_, placeId) => {
      queryClient.invalidateQueries({ queryKey: placesKeys.list() });
      queryClient.removeQueries({ queryKey: placesKeys.detail(placeId) });
    },
  });
};
