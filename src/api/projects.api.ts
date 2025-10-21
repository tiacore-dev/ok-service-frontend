import { apiClient } from "./base";
import type { IProject } from "../interfaces/projects/IProject";
import type { IProjectsList } from "../interfaces/projects/IProjectsList";
import type { IProjectStat } from "../interfaces/projects/IProjectStat";

export interface EditableProjectPayload extends Omit<IProject, "project_id"> {}

export interface CreateProjectResponse {
  project: IProject;
  project_id?: string;
  msg?: string;
}

export const fetchProjects = async (): Promise<IProjectsList[]> => {
  const { data } = await apiClient.get<{ projects: IProjectsList[] }>(
    "/projects/all",
  );
  return data.projects;
};

export const fetchProject = async (projectId: string): Promise<IProject> => {
  const { data } = await apiClient.get<{ project: IProject }>(
    `/projects/${projectId}/view`,
  );
  return data.project;
};

export const fetchProjectStat = async (
  projectId: string,
): Promise<Record<string, IProjectStat>> => {
  const { data } = await apiClient.get<{ stats: Record<string, IProjectStat> }>(
    `/projects/${projectId}/get-stat`,
  );
  return data.stats;
};

export const createProject = async (
  payload: EditableProjectPayload,
): Promise<CreateProjectResponse> => {
  const { data } = await apiClient.post<CreateProjectResponse>(
    "/projects/add",
    payload,
  );
  return data;
};

export const updateProject = async (
  projectId: string,
  payload: EditableProjectPayload,
): Promise<IProject> => {
  const { data } = await apiClient.patch<{ project: IProject }>(
    `/projects/${projectId}/edit`,
    payload,
  );
  return data.project;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/delete/hard`);
};
