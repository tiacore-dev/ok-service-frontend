import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createMeasurementUnit,
  deleteMeasurementUnit,
  fetchMeasurementUnits,
  updateMeasurementUnit,
  type EditableMeasurementUnitPayload,
  type IMeasurementUnitMessage,
} from "../api/measurement-units.api";
import type { IMeasurementUnit } from "../interfaces/measurementUnits/IMeasurementUnit";
import { createQueryKeys } from "../queryKeys";

export const measurementUnitsKeys = createQueryKeys("measurementUnits");

type MeasurementUnitsQueryOptions<TData> = Omit<
  UseQueryOptions<IMeasurementUnit[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useMeasurementUnitsQuery = <TData = IMeasurementUnit[]>(
  options?: MeasurementUnitsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: measurementUnitsKeys.list(),
    queryFn: fetchMeasurementUnits,
    ...options,
  });

export const useCreateMeasurementUnitMutation = (): UseMutationResult<
  IMeasurementUnitMessage,
  Error,
  EditableMeasurementUnitPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMeasurementUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementUnitsKeys.list() });
    },
  });
};

export interface UpdateMeasurementUnitVariables {
  measurementUnitId: string;
  payload: EditableMeasurementUnitPayload;
}

export const useUpdateMeasurementUnitMutation = (): UseMutationResult<
  IMeasurementUnitMessage,
  Error,
  UpdateMeasurementUnitVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ measurementUnitId, payload }) =>
      updateMeasurementUnit(measurementUnitId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementUnitsKeys.list() });
    },
  });
};

export const useDeleteMeasurementUnitMutation = (): UseMutationResult<
  IMeasurementUnitMessage,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMeasurementUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementUnitsKeys.list() });
    },
  });
};
