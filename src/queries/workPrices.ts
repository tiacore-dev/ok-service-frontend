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
  createWorkPrice,
  deleteWorkPrice,
  fetchWorkPrices,
  updateWorkPrice,
  type EditableWorkPricePayload,
} from "../api/work-prices.api";
import type { IWorkPricesList } from "../interfaces/workPrices/IWorkPricesList";
import type { IWorkPrice } from "../interfaces/workPrices/IWorkPrice";
import { createQueryKeys } from "../queryKeys";

export const workPricesKeys = createQueryKeys("workPrices");

type WorkPricesQueryOptions<TData> = Omit<
  UseQueryOptions<IWorkPricesList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useWorkPricesQuery = <TData = IWorkPricesList[]>(
  params?: Record<string, string>,
  options?: WorkPricesQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: workPricesKeys.list(params ?? {}),
    queryFn: () => fetchWorkPrices(params),
    ...options,
  });

export const useWorkPricesMap = (
  params?: Record<string, string>,
  options?: WorkPricesQueryOptions<IWorkPricesList[]>,
): UseQueryResult<IWorkPricesList[], Error> & {
  workPrices: IWorkPricesList[];
  workPricesMap: Record<string, IWorkPrice>;
} => {
  const query = useWorkPricesQuery(params, options);
  const workPrices = query.data ?? [];

  const workPricesMap = useMemo(() => {
    return workPrices.reduce<Record<string, IWorkPrice>>((acc, price) => {
      acc[price.work] = price;
      return acc;
    }, {});
  }, [workPrices]);

  return { ...query, workPrices, workPricesMap };
};

export const useCreateWorkPriceMutation = (): UseMutationResult<
  IWorkPrice,
  Error,
  EditableWorkPricePayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkPrice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workPricesKeys.list({ work: variables.work }),
      });
    },
  });
};

export interface UpdateWorkPriceVariables {
  workPriceId: string;
  payload: EditableWorkPricePayload;
}

export const useUpdateWorkPriceMutation = (): UseMutationResult<
  IWorkPrice,
  Error,
  UpdateWorkPriceVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workPriceId, payload }) =>
      updateWorkPrice(workPriceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workPricesKeys.list({ work: variables.payload.work }),
      });
      queryClient.invalidateQueries({ queryKey: workPricesKeys.list() });
    },
  });
};

export const useDeleteWorkPriceMutation = (): UseMutationResult<
  void,
  Error,
  { workPriceId: string; workId: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workPriceId }) => deleteWorkPrice(workPriceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workPricesKeys.list({ work: variables.workId }),
      });
      queryClient.invalidateQueries({ queryKey: workPricesKeys.list() });
    },
  });
};

export type { EditableWorkPricePayload };
