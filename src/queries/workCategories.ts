import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createWorkCategory,
  deleteWorkCategory,
  fetchWorkCategories,
  updateWorkCategory,
  type EditableWorkCategoryPayload,
} from "../api/work-categories.api";
import type { IWorkCategoriesList } from "../interfaces/workCategories/IWorkCategoriesList";
import type { IWorkCategory } from "../interfaces/workCategories/IWorkCategory";
import { createQueryKeys } from "../queryKeys";

export const workCategoriesKeys = createQueryKeys("workCategories");

type WorkCategoriesQueryOptions<TData> = Omit<
  UseQueryOptions<IWorkCategoriesList[], Error, TData>,
  "queryKey" | "queryFn"
>;

export const useWorkCategoriesQuery = <TData = IWorkCategoriesList[]>(
  options?: WorkCategoriesQueryOptions<TData>,
): UseQueryResult<TData, Error> =>
  useQuery({
    queryKey: workCategoriesKeys.list(),
    queryFn: fetchWorkCategories,
    ...options,
  });

export const useCreateWorkCategoryMutation = (): UseMutationResult<
  IWorkCategory,
  Error,
  EditableWorkCategoryPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCategoriesKeys.list() });
    },
  });
};

export interface UpdateWorkCategoryVariables {
  categoryId: string;
  payload: EditableWorkCategoryPayload;
}

export const useUpdateWorkCategoryMutation = (): UseMutationResult<
  IWorkCategory,
  Error,
  UpdateWorkCategoryVariables
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, payload }) =>
      updateWorkCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCategoriesKeys.list() });
    },
  });
};

export const useDeleteWorkCategoryMutation = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId) => deleteWorkCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCategoriesKeys.list() });
    },
  });
};

export type { EditableWorkCategoryPayload };
