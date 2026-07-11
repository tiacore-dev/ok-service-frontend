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
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
  type EditablePositionPayload,
} from "../api/positions.api";
import type { IPosition } from "../interfaces/positions/IPosition";
import type { IPositionsList } from "../interfaces/positions/IPositionsList";
import { createQueryKeys } from "../queryKeys";

export const positionsKeys = createQueryKeys("positions");

type PositionsQueryOptions<TData> = Omit<
  UseQueryOptions<IPositionsList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const usePositionsQuery = <TData = IPositionsList[]>(
  options?: PositionsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: positionsKeys.list(),
    queryFn: fetchPositions,
    ...options,
  });

export const usePositionsMap = (
  options?: PositionsQueryOptions<IPositionsList[]>,
): UseQueryResult<IPositionsList[], Error> & {
  positions: IPositionsList[];
  positionsMap: Record<string, IPosition>;
  positionOptions: { label: string; value: string }[];
} => {
  const query = usePositionsQuery(options);
  const positions = query.data ?? [];
  const positionsMap = useMemo(
    () =>
      positions.reduce<Record<string, IPosition>>((acc, position) => {
        acc[position.position_id] = position;
        return acc;
      }, {}),
    [positions],
  );
  const positionOptions = useMemo(
    () =>
      positions.map((position) => ({
        label: position.name,
        value: position.position_id,
      })),
    [positions],
  );

  return { ...query, positions, positionsMap, positionOptions };
};

export interface UpdatePositionVariables {
  positionId: string;
  payload: EditablePositionPayload;
}

const invalidatePositions = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: positionsKeys.list() });

export const useCreatePositionMutation = (): UseMutationResult<
  void,
  Error,
  EditablePositionPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => invalidatePositions(queryClient),
  });
};

export const useUpdatePositionMutation = (): UseMutationResult<
  void,
  Error,
  UpdatePositionVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ positionId, payload }) =>
      updatePosition(positionId, payload),
    onSuccess: () => invalidatePositions(queryClient),
  });
};

export const useDeletePositionMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => invalidatePositions(queryClient),
  });
};
