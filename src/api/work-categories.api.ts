import { apiClient } from "./base";
import type { IWorkCategory } from "../interfaces/workCategories/IWorkCategory";
import type { IWorkCategoriesList } from "../interfaces/workCategories/IWorkCategoriesList";

export interface EditableWorkCategoryPayload extends Omit<
  IWorkCategory,
  "work_category_id"
> {}

export interface WorkCategoryMutationResponse {
  msg: string;
  work_category_id: string;
}

export const fetchWorkCategories = async (): Promise<IWorkCategoriesList[]> => {
  const categories: IWorkCategoriesList[] = [];
  const limit = 1000;
  for (let offset = 0; ; offset += limit) {
    const { data } = await apiClient.get<{
      work_categories: IWorkCategoriesList[];
    }>("/work_categories/all", {
      params: { offset, limit, sort_by: "work_category_id", sort_order: "asc" },
    });
    categories.push(...data.work_categories);
    if (data.work_categories.length < limit) return categories;
  }
};

export const createWorkCategory = async (
  payload: EditableWorkCategoryPayload,
): Promise<WorkCategoryMutationResponse> => {
  const { data } = await apiClient.post<WorkCategoryMutationResponse>(
    "/work_categories/add",
    payload,
  );
  return data;
};

export const updateWorkCategory = async (
  categoryId: string,
  payload: Partial<EditableWorkCategoryPayload>,
): Promise<WorkCategoryMutationResponse> => {
  const { data } = await apiClient.patch<WorkCategoryMutationResponse>(
    `/work_categories/${categoryId}/edit`,
    payload,
  );
  return data;
};

export const deleteWorkCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(`/work_categories/${categoryId}/delete/hard`);
};
