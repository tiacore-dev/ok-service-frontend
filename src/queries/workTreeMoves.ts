import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { updateWork } from "../api/works.api";
import { updateWorkCategory } from "../api/work-categories.api";
import type { IWork } from "../interfaces/works/IWork";
import type { IWorksList } from "../interfaces/works/IWorksList";
import type { IWorkCategoriesList } from "../interfaces/workCategories/IWorkCategoriesList";
import { worksKeys } from "./works";
import { workCategoriesKeys } from "./workCategories";

interface MoveWorkVariables {
  workId: string;
  category: IWorkCategoriesList;
}

interface MoveCategoryVariables {
  categoryId: string;
  parentId: string | null;
}

const updateCachedWorks = (
  queryClient: QueryClient,
  matches: (work: IWork) => boolean,
  update: (work: IWork) => IWork,
) => {
  queryClient.setQueryData<IWorksList[]>(worksKeys.list(), (works) =>
    works?.some(matches)
      ? works.map((work) => (matches(work) ? update(work) : work))
      : undefined,
  );
  queryClient.setQueriesData<IWork>(
    {
      queryKey: worksKeys.all(),
      predicate: (query) =>
        query.queryKey[1] === "detail" &&
        Boolean(query.state.data && matches(query.state.data as IWork)),
    },
    (work) => (work ? update(work) : work),
  );
};

export const workMoveMutationOptions = (queryClient: QueryClient) => ({
  mutationFn: async ({
    workId,
    category,
  }: MoveWorkVariables): Promise<void> => {
    await updateWork(workId, { category: category.work_category_id });
  },
  onSuccess: async (_: void, { workId, category }: MoveWorkVariables) => {
    // A list request started before the save must not overwrite the confirmed move.
    await Promise.all([
      queryClient.cancelQueries({ queryKey: worksKeys.list(), exact: true }),
      queryClient.cancelQueries({
        queryKey: worksKeys.detail(workId),
        exact: true,
      }),
    ]);
    const destination =
      queryClient
        .getQueryData<IWorkCategoriesList[]>(workCategoriesKeys.list())
        ?.find((item) => item.work_category_id === category.work_category_id) ??
      category;
    updateCachedWorks(
      queryClient,
      (work) => work.work_id === workId,
      (work) => ({ ...work, category: { ...work.category, ...destination } }),
    );
  },
});

export const categoryMoveMutationOptions = (queryClient: QueryClient) => ({
  mutationFn: async ({
    categoryId,
    parentId,
  }: MoveCategoryVariables): Promise<void> => {
    await updateWorkCategory(categoryId, { parent_id: parentId });
  },
  onSuccess: async (
    _: void,
    { categoryId, parentId }: MoveCategoryVariables,
  ) => {
    await Promise.all([
      queryClient.cancelQueries({
        queryKey: workCategoriesKeys.list(),
        exact: true,
      }),
      queryClient.cancelQueries({ queryKey: worksKeys.list(), exact: true }),
      queryClient.cancelQueries({
        queryKey: worksKeys.all(),
        predicate: (query) =>
          query.queryKey[1] === "detail" &&
          (query.state.data as IWork | undefined)?.category.work_category_id ===
            categoryId,
      }),
    ]);
    queryClient.setQueryData<IWorkCategoriesList[]>(
      workCategoriesKeys.list(),
      (categories) =>
        categories?.map((category) =>
          category.work_category_id === categoryId
            ? { ...category, parent_id: parentId }
            : category,
        ),
    );
    updateCachedWorks(
      queryClient,
      (work) => work.category.work_category_id === categoryId,
      (work) => ({
        ...work,
        category: { ...work.category, parent_id: parentId },
      }),
    );
  },
});

export const useMoveWorkMutation = () =>
  useMutation(workMoveMutationOptions(useQueryClient()));
export const useMoveWorkCategoryMutation = () =>
  useMutation(categoryMoveMutationOptions(useQueryClient()));
