import { apiClient } from "./base";
import type { IWork } from "../interfaces/works/IWork";
import type { IWorksList } from "../interfaces/works/IWorksList";

export interface EditableWorkPayload extends Omit<
  IWork,
  "work_id" | "category" | "measurement_unit"
> {
  category: string;
  measurement_unit: string;
}

export const fetchWorks = async (): Promise<IWorksList[]> => {
  const works: IWorksList[] = [];
  const limit = 1000;
  for (let offset = 0; ; offset += limit) {
    const { data } = await apiClient.get<{ works: IWorksList[] }>(
      "/works/all",
      {
        params: { offset, limit, sort_by: "work_id", sort_order: "asc" },
      },
    );
    works.push(...data.works);
    if (data.works.length < limit) return works;
  }
};

export const fetchWork = async (workId: string): Promise<IWork> => {
  const { data } = await apiClient.get<{ work: IWork }>(
    `/works/${workId}/view`,
  );
  return data.work;
};

export const createWork = async (
  payload: EditableWorkPayload,
): Promise<IWork> => {
  const { data } = await apiClient.post<{ work: IWork }>("/works/add", payload);
  return data.work;
};

export const updateWork = async (
  workId: string,
  payload: Partial<EditableWorkPayload>,
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
