import { apiClient } from "./base";
import type { IWork } from "../interfaces/works/IWork";
import type { IWorksList } from "../interfaces/works/IWorksList";

export interface EditableWorkPayload extends Omit<IWork, "work_id" | "category"> {
  category: string;
}

export const fetchWorks = async (): Promise<IWorksList[]> => {
  const { data } = await apiClient.get<{ works: IWorksList[] }>("/works/all");
  return data.works;
};

export const fetchWork = async (workId: string): Promise<IWork> => {
  const { data } = await apiClient.get<{ work: IWork }>(`/works/${workId}/view`);
  return data.work;
};

export const createWork = async (payload: EditableWorkPayload): Promise<IWork> => {
  const { data } = await apiClient.post<{ work: IWork }>("/works/add", payload);
  return data.work;
};

export const updateWork = async (
  workId: string,
  payload: EditableWorkPayload,
): Promise<IWork> => {
  const { data } = await apiClient.patch<{ work: IWork }>(
    `/works/${workId}/edit`,
    payload,
  );
  return data.work;
};

export const deleteWork = async (workId: string): Promise<void> => {
  await apiClient.patch(`/works/${workId}/delete/soft`);
};
