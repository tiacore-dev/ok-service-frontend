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
  createWork,
  deleteWork,
  fetchWork,
  fetchWorks,
  updateWork,
  type EditableWorkPayload,
} from "../api/works.api";
import type { IWork } from "../interfaces/works/IWork";
import type { IWorksList } from "../interfaces/works/IWorksList";
import { createQueryKeys } from "../queryKeys";

const worksKeys = createQueryKeys("works");

type WorksQueryOptions<TData> = Omit<
  UseQueryOptions<IWorksList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useWorksQuery = <TData = IWorksList[]>(
  options?: WorksQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: worksKeys.list(),
    queryFn: fetchWorks,
    ...options,
  });

type WorkQueryOptions<TData> = Omit<
  UseQueryOptions<IWork, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useWorkQuery = <TData = IWork>(
  workId: string | undefined,
  options?: WorkQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(workId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: worksKeys.detail(workId ?? "unknown"),
    queryFn: () => fetchWork(workId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useWorksMap = (
  options?: WorksQueryOptions<IWorksList[]>,
): UseQueryResult<IWorksList[], Error> & {
  works: IWorksList[];
  worksMap: Record<string, IWork>;
} => {
  const query = useWorksQuery(options);
  const works = query.data ?? [];

  const worksMap = useMemo(() => {
    return works.reduce<Record<string, IWork>>((acc, work) => {
      if (work.work_id) {
        acc[work.work_id] = work;
      }
      return acc;
    }, {});
  }, [works]);

  return { ...query, works, worksMap };
};

export const useCreateWorkMutation = (): UseMutationResult<
  IWork,
  Error,
  EditableWorkPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: worksKeys.list() });
    },
  });
};

export interface UpdateWorkVariables {
  workId: string;
  payload: EditableWorkPayload;
}

export const useUpdateWorkMutation = (): UseMutationResult<
  IWork,
  Error,
  UpdateWorkVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, payload }) => updateWork(workId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.list() });
      queryClient.invalidateQueries({
        queryKey: worksKeys.detail(variables.workId),
      });
    },
  });
};

export const useDeleteWorkMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workId) => deleteWork(workId),
    onSuccess: (_, workId) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.list() });
      queryClient.removeQueries({ queryKey: worksKeys.detail(workId) });
    },
  });
};

export type { EditableWorkPayload };
