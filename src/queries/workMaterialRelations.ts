import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createWorkMaterialRelation,
  deleteWorkMaterialRelation,
  fetchWorkMaterialRelations,
  updateWorkMaterialRelation,
  type EditableWorkMaterialRelationPayload,
} from "../api/work-material-relations.api";
import type { IWorkMaterialRelationsList } from "../interfaces/workMaterialRelations/IWorkMaterialRelationsList";
import type { IWorkMaterialRelation } from "../interfaces/workMaterialRelations/IWorkMaterialRelation";
import { createQueryKeys } from "../queryKeys";

export const workMaterialRelationsKeys = createQueryKeys(
  "workMaterialRelations",
);

type WorkMaterialRelationsQueryOptions<TData> = Omit<
  UseQueryOptions<IWorkMaterialRelationsList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useWorkMaterialRelationsQuery = <
  TData = IWorkMaterialRelationsList[],
>(
  params?: Record<string, string>,
  options?: WorkMaterialRelationsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: workMaterialRelationsKeys.list(params ?? {}),
    queryFn: () => fetchWorkMaterialRelations(params),
    ...options,
  });

export const useCreateWorkMaterialRelationMutation = (): UseMutationResult<
  IWorkMaterialRelation,
  Error,
  EditableWorkMaterialRelationPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkMaterialRelation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list({
          material: variables.material,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list({
          work: variables.work,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list(),
      });
    },
  });
};

export interface UpdateWorkMaterialRelationVariables {
  relationId: string;
  payload: EditableWorkMaterialRelationPayload;
}

export const useUpdateWorkMaterialRelationMutation = (): UseMutationResult<
  IWorkMaterialRelation,
  Error,
  UpdateWorkMaterialRelationVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ relationId, payload }) =>
      updateWorkMaterialRelation(relationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list({
          material: variables.payload.material,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list({
          work: variables.payload.work,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list(),
      });
    },
  });
};

export const useDeleteWorkMaterialRelationMutation = (): UseMutationResult<
  void,
  Error,
  { relationId: string; materialId?: string; workId?: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ relationId }) => deleteWorkMaterialRelation(relationId),
    onSuccess: (_, variables) => {
      if (variables.materialId) {
        queryClient.invalidateQueries({
          queryKey: workMaterialRelationsKeys.list({
            material: variables.materialId,
          }),
        });
      }
      if (variables.workId) {
        queryClient.invalidateQueries({
          queryKey: workMaterialRelationsKeys.list({
            work: variables.workId,
          }),
        });
      }
      queryClient.invalidateQueries({
        queryKey: workMaterialRelationsKeys.list(),
      });
    },
  });
};

export type { EditableWorkMaterialRelationPayload };
