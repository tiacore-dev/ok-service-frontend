import type { IWorkCategoriesList } from "../interfaces/workCategories/IWorkCategoriesList";
import type { IWorksListColumn } from "../interfaces/works/IWorksList";
import type { WorksFiltersState } from "../interfaces/works/IWorksFiltersState";

export interface WorkCategoryNode extends IWorkCategoriesList {
  key: string;
  children?: WorkCategoryNode[];
}

export type WorksTreeRow =
  | {
      key: string;
      name: string;
      kind: "category";
      category: IWorkCategoriesList;
      children?: WorksTreeRow[];
    }
  | {
      key: string;
      name: string;
      kind: "work";
      work: IWorksListColumn;
      children?: never;
    };

const collator = new Intl.Collator("ru", {
  sensitivity: "base",
  numeric: true,
});
export const compareNames = (a: { name: string }, b: { name: string }) =>
  collator.compare(a.name, b.name);

export const getDescendantCategoryIds = (
  categories: IWorkCategoriesList[],
  categoryId: string,
): Set<string> => {
  const children = new Map<string, string[]>();
  categories.forEach((category) => {
    if (category.parent_id && category.work_category_id) {
      const siblings = children.get(category.parent_id) ?? [];
      siblings.push(category.work_category_id);
      children.set(category.parent_id, siblings);
    }
  });
  const result = new Set<string>();
  const pending = [categoryId];
  while (pending.length) {
    const id = pending.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    pending.push(...(children.get(id) ?? []));
  }
  return result;
};

export const canMoveCategory = (
  categories: IWorkCategoriesList[],
  categoryId: string,
  parentId: string | null,
): boolean => {
  const category = categories.find(
    (item) => item.work_category_id === categoryId,
  );
  if (
    !category ||
    category.deleted ||
    (category.parent_id ?? null) === parentId
  )
    return false;
  if (parentId === null) return true;
  const parent = categories.find((item) => item.work_category_id === parentId);
  return Boolean(
    parent &&
    !parent.deleted &&
    !getDescendantCategoryIds(categories, categoryId).has(parentId),
  );
};

export const canMoveWork = (
  categories: IWorkCategoriesList[],
  work: IWorksListColumn,
  categoryId: string | null,
): boolean => {
  const category = categories.find(
    (item) => item.work_category_id === categoryId,
  );
  return Boolean(
    work.work_id &&
    categoryId &&
    category &&
    !category.deleted &&
    categoryId !== work.category.work_category_id,
  );
};

export const buildWorkCategoryTree = (
  categories: IWorkCategoriesList[],
): WorkCategoryNode[] => {
  const nodes = new Map<string, WorkCategoryNode>();
  categories.forEach((category) => {
    if (category.work_category_id) {
      nodes.set(category.work_category_id, {
        ...category,
        key: category.work_category_id,
      });
    }
  });
  const roots: WorkCategoryNode[] = [];
  nodes.forEach((node) => {
    // Keep malformed/orphaned categories visible without recursing through cycles.
    const visited = new Set([node.key]);
    let parentId = node.parent_id;
    let cyclic = false;
    while (parentId && nodes.has(parentId)) {
      if (visited.has(parentId)) {
        cyclic = true;
        break;
      }
      visited.add(parentId);
      parentId = nodes.get(parentId)!.parent_id;
    }
    const parent =
      node.parent_id && !cyclic ? nodes.get(node.parent_id) : undefined;
    if (parent) (parent.children ??= []).push(node);
    else roots.push(node);
  });
  const sort = (siblings: WorkCategoryNode[]) => {
    siblings.sort(compareNames);
    siblings.forEach((node) => {
      if (node.children) sort(node.children);
    });
  };
  sort(roots);
  return roots;
};

export interface WorkCategoryOption {
  title: string;
  value: string;
  disabled: boolean;
  children?: WorkCategoryOption[];
}

export const workCategoryOptions = (
  categories: IWorkCategoriesList[],
  excludedIds = new Set<string>(),
): WorkCategoryOption[] => {
  const convert = (nodes: WorkCategoryNode[]): WorkCategoryOption[] =>
    nodes
      .filter((node) => !excludedIds.has(node.key))
      .map((node) => ({
        title: node.name,
        value: node.key,
        disabled: Boolean(node.deleted),
        children: node.children ? convert(node.children) : undefined,
      }));
  return convert(buildWorkCategoryTree(categories));
};

export const buildWorksTree = (
  categories: IWorkCategoriesList[],
  works: IWorksListColumn[],
  filters: WorksFiltersState,
): WorksTreeRow[] => {
  // Embedded categories keep existing works visible if a category is missing from the directory.
  const completeCategories = new Map(
    categories.map((category) => [category.work_category_id, category]),
  );
  works.forEach((work) => {
    if (
      work.category?.work_category_id &&
      !completeCategories.has(work.category.work_category_id)
    ) {
      completeCategories.set(work.category.work_category_id, work.category);
    }
  });
  const allCategories = Array.from(completeCategories.values());
  const scope = filters.categoryId
    ? getDescendantCategoryIds(allCategories, filters.categoryId)
    : null;
  const search = filters.search.trim().toLocaleLowerCase("ru");
  const byCategory = new Map<string, IWorksListColumn[]>();
  works.forEach((work) => {
    const id = work.category?.work_category_id;
    const matchesDeleted =
      filters.deletedFilter === "all" ||
      (filters.deletedFilter === "deleted"
        ? Boolean(work.deleted)
        : !work.deleted);
    if (!id || !matchesDeleted || (scope && !scope.has(id))) return;
    const siblings = byCategory.get(id) ?? [];
    siblings.push(work);
    byCategory.set(id, siblings);
  });
  const convert = (
    nodes: WorkCategoryNode[],
    ancestorMatches = false,
  ): WorksTreeRow[] =>
    nodes.flatMap((node) => {
      const inScope = !scope || scope.has(node.key);
      const categoryMatches =
        ancestorMatches ||
        (inScope && node.name.toLocaleLowerCase("ru").includes(search));
      const categoryRows = convert(node.children ?? [], categoryMatches);
      const workRows: WorksTreeRow[] = (byCategory.get(node.key) ?? [])
        .filter(
          (work) =>
            !search ||
            categoryMatches ||
            work.name.toLocaleLowerCase("ru").includes(search),
        )
        .sort(compareNames)
        .map((work) => ({
          kind: "work",
          key: `work-${work.key}`,
          name: work.name,
          work,
        }));
      const children = [...categoryRows, ...workRows];
      if (!children.length && (!inScope || (search && !categoryMatches)))
        return [];
      return [
        {
          kind: "category",
          key: `category-${node.key}`,
          name: node.name,
          category: node,
          ...(children.length ? { children } : {}),
        },
      ];
    });
  return convert(buildWorkCategoryTree(allCategories));
};

export const expandableWorkTreeKeys = (nodes: WorksTreeRow[]): string[] =>
  nodes.flatMap((node) =>
    node.children?.length
      ? [node.key, ...expandableWorkTreeKeys(node.children)]
      : [],
  );
