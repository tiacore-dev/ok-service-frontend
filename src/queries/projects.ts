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
  createProject,
  deleteProject,
  fetchProject,
  fetchProjectStat,
  fetchProjects,
  updateProject,
  type CreateProjectResponse,
  type EditableProjectPayload,
} from "../api/projects.api";
export type { EditableProjectPayload } from "../api/projects.api";
import type { IProject } from "../interfaces/projects/IProject";
import type { IProjectsList } from "../interfaces/projects/IProjectsList";
import type { IProjectStat } from "../interfaces/projects/IProjectStat";
import { createQueryKeys } from "../queryKeys";

const baseProjectsKeys = createQueryKeys("projects");

export const projectsKeys = {
  ...baseProjectsKeys,
  stat: (projectId: string) => ["projects", "stat", projectId] as const,
};

type ProjectsQueryOptions<TData> = Omit<
  UseQueryOptions<IProjectsList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useProjectsQuery = <TData = IProjectsList[]>(
  options?: ProjectsQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: projectsKeys.list(),
    queryFn: fetchProjects,
    ...options,
  });

type ProjectQueryOptions<TData> = Omit<
  UseQueryOptions<IProject, Error, TData>,
  "queryKey" | "queryFn"
>;

export const useProjectQuery = <TData = IProject>(
  projectId: string | undefined,
  options?: ProjectQueryOptions<TData>,
): UseQueryResult<TData, Error> => {
  const enabled = Boolean(projectId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: projectsKeys.detail(projectId ?? "unknown"),
    queryFn: () => fetchProject(projectId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useProjectStatQuery = (
  projectId: string | undefined,
  options?: Omit<
    UseQueryOptions<Record<string, IProjectStat>, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<Record<string, IProjectStat>, Error> => {
  const enabled = Boolean(projectId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: projectsKeys.stat(projectId ?? "unknown"),
    queryFn: () => fetchProjectStat(projectId!),
    ...(options ?? {}),
    enabled,
  });
};

export const useProjectsMap = (
  options?: ProjectsQueryOptions<IProjectsList[]>,
): UseQueryResult<IProjectsList[], Error> & {
  projects: IProjectsList[];
  projectsMap: Record<string, IProject>;
} => {
  const query = useProjectsQuery(options);
  const projects = query.data ?? [];

  const projectsMap = useMemo(() => {
    return projects.reduce<Record<string, IProject>>((acc, project) => {
      if (project.project_id) {
        acc[project.project_id] = project;
      }
      return acc;
    }, {});
  }, [projects]);

  return { ...query, projects, projectsMap };
};

export const useCreateProjectMutation = (): UseMutationResult<
  CreateProjectResponse,
  Error,
  EditableProjectPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.list() });
    },
  });
};

export interface UpdateProjectVariables {
  projectId: string;
  payload: EditableProjectPayload;
}

export const useUpdateProjectMutation = (): UseMutationResult<
  IProject,
  Error,
  UpdateProjectVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }) => updateProject(projectId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.list() });
      queryClient.invalidateQueries({
        queryKey: projectsKeys.detail(variables.projectId),
      });
    },
  });
};

export const useDeleteProjectMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => deleteProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.list() });
      queryClient.removeQueries({ queryKey: projectsKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: projectsKeys.stat(projectId) });
    },
  });
};
