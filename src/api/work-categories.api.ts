import { apiClient } from "./base";
import type { IWorkCategory } from "../interfaces/workCategories/IWorkCategory";
import type { IWorkCategoriesList } from "../interfaces/workCategories/IWorkCategoriesList";

export interface EditableWorkCategoryPayload
  extends Omit<IWorkCategory, "work_category_id"> {}

export const fetchWorkCategories = async (): Promise<IWorkCategoriesList[]> => {
  const { data } = await apiClient.get<{
    work_categories: IWorkCategoriesList[];
  }>("/work_categories/all", {
    params: { sort_by: "created_at" },
  });
  return data.work_categories;
};

export const createWorkCategory = async (
  payload: EditableWorkCategoryPayload,
): Promise<IWorkCategory> => {
  const { data } = await apiClient.post<{ work: IWorkCategory }>(
    "/work_categories/add",
    payload,
  );
  return data.work;
};

export const updateWorkCategory = async (
  categoryId: string,
  payload: EditableWorkCategoryPayload,
): Promise<IWorkCategory> => {
  const { data } = await apiClient.patch<{ work: IWorkCategory }>(
    `/work_categories/${categoryId}/edit`,
    payload,
  );
  return data.work;
};

export const deleteWorkCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(`/work_categories/${categoryId}/delete/hard`);
};
