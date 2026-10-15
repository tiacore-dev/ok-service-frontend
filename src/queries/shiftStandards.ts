import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createShiftStandard,
  deleteShiftStandard,
  fetchShiftStandards,
  updateShiftStandard,
  type CreateShiftStandardPayload,
} from "../api/shift-standards.api";
import type { IShiftStandard } from "../interfaces/shiftStandards/IShiftStandard";
import { createQueryKeys } from "../queryKeys";

export const shiftStandardsKeys = createQueryKeys("shiftStandards");

type ShiftStandardsQueryOptions<TData> = Omit<
  UseQueryOptions<IShiftStandard[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useShiftStandardsQuery = <TData = IShiftStandard[]>(
  options?: ShiftStandardsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: shiftStandardsKeys.list(),
    queryFn: fetchShiftStandards,
    ...options,
  });

export const useCreateShiftStandardMutation = (): UseMutationResult<
  void,
  Error,
  CreateShiftStandardPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShiftStandard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftStandardsKeys.list() });
    },
  });
};

interface UpdateShiftStandardVariables {
  shiftStandardId: string;
  payload: CreateShiftStandardPayload;
}

export const useUpdateShiftStandardMutation = (): UseMutationResult<
  void,
  Error,
  UpdateShiftStandardVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftStandardId, payload }) =>
      updateShiftStandard(shiftStandardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftStandardsKeys.list() });
    },
  });
};

export const useDeleteShiftStandardMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShiftStandard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftStandardsKeys.list() });
    },
  });
};
