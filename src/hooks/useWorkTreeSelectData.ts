import { useCallback, useMemo } from "react";
import { useWorksMap } from "../queries/works";
import { useWorkCategoriesQuery } from "../queries/workCategories";
import { buildWorkSelectTree } from "../utils/workSelectTree";

export const useWorkTreeSelectData = () => {
  const worksQuery = useWorksMap();
  const categoriesQuery = useWorkCategoriesQuery();
  const availableWorks = useMemo(
    () =>
      worksQuery.works.filter((work) => !work.deleted && Boolean(work.work_id)),
    [worksQuery.works],
  );
  const treeData = useMemo(
    () => buildWorkSelectTree(categoriesQuery.data ?? [], availableWorks),
    [categoriesQuery.data, availableWorks],
  );
  const workIds = useMemo(
    () => new Set(availableWorks.map((work) => work.work_id!)),
    [availableWorks],
  );
  const retry = useCallback(() => {
    void worksQuery.refetch();
    void categoriesQuery.refetch();
  }, [worksQuery.refetch, categoriesQuery.refetch]);
  const loading =
    worksQuery.isPending ||
    worksQuery.isFetching ||
    categoriesQuery.isPending ||
    categoriesQuery.isFetching;
  const error = worksQuery.isError || categoriesQuery.isError;
  const selectData = useMemo(
    () => ({ treeData, workIds, loading, error, retry }),
    [treeData, workIds, loading, error, retry],
  );
  return { selectData, availableWorks, worksMap: worksQuery.worksMap };
};

export type WorkTreeSelectData = ReturnType<
  typeof useWorkTreeSelectData
>["selectData"];
