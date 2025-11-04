import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import { createQueryKeys } from "../queryKeys";
import { ILeaveList } from "../interfaces/leaves/ILeaveList";
import {
  createLeave,
  deleteLeave,
  EditableLeavePayload,
  fetchLeave,
  fetchLeaves,
  updateLeave,
} from "../api/leaves.api";
import { ILeave } from "../interfaces/leaves/ILeave";

export const leavesKeys = createQueryKeys("leaves");

type LeavesQueryOptions<TData> = Omit<
  UseQueryOptions<ILeaveList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useLeavesQuery = <TData = ILeaveList[]>(
  options?: LeavesQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: leavesKeys.list(),
    queryFn: fetchLeaves,
    ...options,
  });

type LeaveQueryOptions<TData> = Omit<
  UseQueryOptions<ILeave, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useLeaveQuery = <TData = ILeave>(
  leaveId: string | undefined,
  options?: LeaveQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(leaveId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: leavesKeys.detail(leaveId ?? "unknown"),
    queryFn: () => fetchLeave(leaveId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useLeavesMap = (
  options?: LeavesQueryOptions<ILeaveList[]>,
): UseQueryResult<ILeaveList[], Error> & {
  leaves: ILeaveList[];
  leavesMap: Record<string, ILeave>;
} => {
  const query = useLeavesQuery(options);
  const leaves = query.data ?? [];

  const leavesMap = useMemo(() => {
    return leaves.reduce<Record<string, ILeave>>((acc, leave) => {
      acc[leave.leave_id] = leave;
      return acc;
    }, {});
  }, [leaves]);

  return { ...query, leaves, leavesMap };
};

export interface UpdateLeaveVariables {
  leaveId: string;
  payload: EditableLeavePayload;
}

export const useCreateLeaveMutation = (): UseMutationResult<
  ILeave,
  Error,
  EditableLeavePayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavesKeys.list() });
    },
  });
};

export const useUpdateLeaveMutation = (): UseMutationResult<
  ILeave,
  Error,
  UpdateLeaveVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leaveId, payload }) => updateLeave(leaveId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leavesKeys.list() });
      queryClient.invalidateQueries({
        queryKey: leavesKeys.detail(variables.leaveId),
      });
    },
  });
};

export const useDeleteLeaveMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaveId) => deleteLeave(leaveId),
    onSuccess: (_, leaveId) => {
      queryClient.invalidateQueries({ queryKey: leavesKeys.list() });
      queryClient.removeQueries({ queryKey: leavesKeys.detail(leaveId) });
    },
  });
};

export type { EditableLeavePayload };
