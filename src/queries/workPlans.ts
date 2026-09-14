import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createWorkPlan,
  deleteWorkPlan,
  fetchWorkPlans,
  updateWorkPlan,
} from "../api/work-plans.api";
import type {
  EditableWorkPlanPayload,
  IWorkPlan,
} from "../interfaces/workPlans/IWorkPlan";

export const workPlansKeys = {
  all: () => ["workPlans"] as const,
  list: (year: number) => ["workPlans", "list", year] as const,
};

export const useWorkPlansQuery = (
  year: number,
): UseQueryResult<IWorkPlan[], Error> =>
  useQuery({
    queryKey: workPlansKeys.list(year),
    queryFn: () => fetchWorkPlans(year),
  });

interface CreateWorkPlanVariables {
  year: number;
  payload: EditableWorkPlanPayload;
}

export const useCreateWorkPlanMutation = (): UseMutationResult<
  string,
  Error,
  CreateWorkPlanVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload }) => createWorkPlan(payload),
    onSuccess: (workPlanId, variables) => {
      queryClient.setQueryData<IWorkPlan[]>(
        workPlansKeys.list(variables.year),
        (plans = []) => [
          ...plans,
          {
            work_plan_id: workPlanId,
            deleted: false,
            ...variables.payload,
          },
        ],
      );
    },
  });
};

interface UpdateWorkPlanVariables extends CreateWorkPlanVariables {
  workPlanId: string;
}

export const useUpdateWorkPlanMutation = (): UseMutationResult<
  void,
  Error,
  UpdateWorkPlanVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workPlanId, payload }) =>
      updateWorkPlan(workPlanId, payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<IWorkPlan[]>(
        workPlansKeys.list(variables.year),
        (plans) =>
          plans?.map((plan) =>
            plan.work_plan_id === variables.workPlanId
              ? { ...plan, ...variables.payload }
              : plan,
          ),
      );
    },
  });
};

interface DeleteWorkPlanVariables {
  year: number;
  workPlanId: string;
}

export const useDeleteWorkPlanMutation = (): UseMutationResult<
  void,
  Error,
  DeleteWorkPlanVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workPlanId }) => deleteWorkPlan(workPlanId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<IWorkPlan[]>(
        workPlansKeys.list(variables.year),
        (plans) =>
          plans?.filter((plan) => plan.work_plan_id !== variables.workPlanId),
      );
    },
  });
};
