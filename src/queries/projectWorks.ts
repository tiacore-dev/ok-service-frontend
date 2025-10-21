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
  createProjectWork,
  createProjectWorks,
  deleteProjectWork,
  fetchProjectWorks,
  updateProjectWork,
  type EditableProjectWorkPayload,
} from "../api/project-works.api";
export type { EditableProjectWorkPayload } from "../api/project-works.api";
import type { IProjectWorksList } from "../interfaces/projectWorks/IProjectWorksList";
import { createQueryKeys } from "../queryKeys";

const baseProjectWorksKeys = createQueryKeys("projectWorks");

export const projectWorksKeys = {
  ...baseProjectWorksKeys,
  listByProject: (projectId?: string) =>
    baseProjectWorksKeys.list({ projectId: projectId ?? "all" }),
};

type ProjectWorksQueryOptions<TData> = Omit<
  UseQueryOptions<IProjectWorksList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useProjectWorksQuery = <TData = IProjectWorksList[]>(
  projectId?: string,
  options?: ProjectWorksQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: projectWorksKeys.listByProject(projectId),
    queryFn: () => fetchProjectWorks(projectId),
    ...options,
  });

export const useProjectWorksMap = (
  projectId?: string,
  options?: ProjectWorksQueryOptions<IProjectWorksList[]>,
): UseQueryResult<IProjectWorksList[], Error> & {
  projectWorks: IProjectWorksList[];
  projectWorksMap: Record<string, IProjectWorksList>;
} => {
  const query = useProjectWorksQuery(projectId, options);
  const projectWorks = query.data ?? [];

  const projectWorksMap = useMemo(() => {
    return projectWorks.reduce<Record<string, IProjectWorksList>>(
      (acc, work) => {
        acc[work.project_work_id] = work;
        return acc;
      },
      {},
    );
  }, [projectWorks]);

  return { ...query, projectWorks, projectWorksMap };
};

export const useCreateProjectWorkMutation = (): UseMutationResult<
  IProjectWorksList,
  Error,
  EditableProjectWorkPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectWork,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorksKeys.listByProject(variables.project),
      });
    },
  });
};

export interface CreateProjectWorksVariables {
  projectId: string;
  payload: EditableProjectWorkPayload[];
}

export const useCreateProjectWorksMutation = (): UseMutationResult<
  void,
  Error,
  CreateProjectWorksVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload }) => createProjectWorks(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorksKeys.listByProject(variables.projectId),
      });
    },
  });
};

export interface UpdateProjectWorkVariables {
  projectWorkId: string;
  payload: EditableProjectWorkPayload;
}

export const useUpdateProjectWorkMutation = (): UseMutationResult<
  IProjectWorksList,
  Error,
  UpdateProjectWorkVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectWorkId, payload }) =>
      updateProjectWork(projectWorkId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorksKeys.listByProject(variables.payload.project),
      });
      queryClient.invalidateQueries({
        queryKey: projectWorksKeys.listByProject(undefined),
      });
    },
  });
};

export interface DeleteProjectWorkVariables {
  projectWorkId: string;
  projectId: string;
}

export const useDeleteProjectWorkMutation = (): UseMutationResult<
  void,
  Error,
  DeleteProjectWorkVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectWorkId }) => deleteProjectWork(projectWorkId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorksKeys.listByProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectWorksKeys.listByProject(undefined),
      });
    },
  });
};
