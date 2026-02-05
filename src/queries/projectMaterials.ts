import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createProjectMaterial,
  deleteProjectMaterial,
  fetchProjectMaterials,
  updateProjectMaterial,
  type EditableProjectMaterialPayload,
} from "../api/project-materials.api";
import type { IProjectMaterial } from "../interfaces/projectMaterials/IProjectMaterial";
import type { IProjectMaterialsList } from "../interfaces/projectMaterials/IProjectMaterialsList";
import { createQueryKeys } from "../queryKeys";

const baseProjectMaterialsKeys = createQueryKeys("projectMaterials");

export const projectMaterialsKeys = {
  ...baseProjectMaterialsKeys,
  listByProject: (projectId?: string) =>
    baseProjectMaterialsKeys.list({ project: projectId ?? "all" }),
};

type ProjectMaterialsQueryOptions<TData> = Omit<
  UseQueryOptions<IProjectMaterialsList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useProjectMaterialsQuery = <TData = IProjectMaterialsList[]>(
  projectId?: string,
  options?: ProjectMaterialsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: projectMaterialsKeys.listByProject(projectId),
    queryFn: () =>
      fetchProjectMaterials(projectId ? { project: projectId } : {}),
    ...options,
  });

export const useCreateProjectMaterialMutation = (): UseMutationResult<
  IProjectMaterial,
  Error,
  EditableProjectMaterialPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectMaterial,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectMaterialsKeys.listByProject(variables.project),
      });
      queryClient.invalidateQueries({
        queryKey: projectMaterialsKeys.list(),
      });
    },
  });
};

export interface UpdateProjectMaterialVariables {
  projectMaterialId: string;
  payload: EditableProjectMaterialPayload;
}

export const useUpdateProjectMaterialMutation = (): UseMutationResult<
  IProjectMaterial,
  Error,
  UpdateProjectMaterialVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectMaterialId, payload }) =>
      updateProjectMaterial(projectMaterialId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectMaterialsKeys.listByProject(variables.payload.project),
      });
      queryClient.invalidateQueries({
        queryKey: projectMaterialsKeys.list(),
      });
    },
  });
};

export interface DeleteProjectMaterialVariables {
  projectMaterialId: string;
  projectId: string;
}

export const useDeleteProjectMaterialMutation = (): UseMutationResult<
  void,
  Error,
  DeleteProjectMaterialVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectMaterialId }) =>
      deleteProjectMaterial(projectMaterialId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectMaterialsKeys.listByProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectMaterialsKeys.list(),
      });
    },
  });
};

export type { EditableProjectMaterialPayload };
