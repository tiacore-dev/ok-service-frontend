import { apiClient } from "./base";
import type { IProjectWork } from "../interfaces/projectWorks/IProjectWork";
import type { IProjectWorksList } from "../interfaces/projectWorks/IProjectWorksList";

export interface EditableProjectWorkPayload
  extends Omit<IProjectWork, "project_work_id"> {}

export const fetchProjectWorks = async (
  projectId?: string,
): Promise<IProjectWorksList[]> => {
  const params: Record<string, string> = { sort_by: "created_at" };
  if (projectId) {
    params.project = projectId;
  }

  const { data } = await apiClient.get<{ project_works: IProjectWorksList[] }>(
    "/project_works/all",
    {
      params,
    },
  );
  return data.project_works;
};

export const createProjectWork = async (
  payload: EditableProjectWorkPayload,
): Promise<IProjectWork> => {
  const { data } = await apiClient.post<{ work: IProjectWork }>(
    "/project_works/add",
    payload,
  );
  return data.work;
};

export const createProjectWorks = async (
  payload: EditableProjectWorkPayload[],
): Promise<void> => {
  await apiClient.post("/project_works/add/many", payload);
};

export const updateProjectWork = async (
  projectWorkId: string,
  payload: EditableProjectWorkPayload,
): Promise<IProjectWork> => {
  const { data } = await apiClient.patch<{ work: IProjectWork }>(
    `/project_works/${projectWorkId}/edit`,
    payload,
  );
  return data.work;
};

export const deleteProjectWork = async (
  projectWorkId: string,
): Promise<void> => {
  await apiClient.delete(`/project_works/${projectWorkId}/delete/hard`);
};
