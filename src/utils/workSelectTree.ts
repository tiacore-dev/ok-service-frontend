import type { IWorkCategoriesList } from "../interfaces/workCategories/IWorkCategoriesList";
import type { IWorksList } from "../interfaces/works/IWorksList";
import { buildWorksTree, type WorksTreeRow } from "./workCategoryTree";

export interface WorkSelectNode {
  key: string;
  value: string;
  title: string;
  selectable: boolean;
  children?: WorkSelectNode[];
}

export const matchesWorkSelectSearch = (
  search: string,
  node: { title?: unknown },
) =>
  typeof node.title === "string" &&
  node.title
    .toLocaleLowerCase("ru")
    .includes(search.trim().toLocaleLowerCase("ru"));

export const buildWorkSelectTree = (
  categories: IWorkCategoriesList[],
  works: IWorksList[],
): WorkSelectNode[] => {
  const tree = buildWorksTree(
    categories,
    works
      .filter((work) => Boolean(work.work_id))
      .map((work) => ({ ...work, key: work.work_id! })),
    {
      search: "",
      deletedFilter: "active",
      sortField: "name",
      sortOrder: "ascend",
    },
  );
  const convert = (rows: WorksTreeRow[]): WorkSelectNode[] =>
    rows.flatMap<WorkSelectNode>((row) => {
      if (row.kind === "work") {
        return [
          {
            key: row.key,
            value: row.work.work_id!,
            title: row.name,
            selectable: true,
          },
        ];
      }
      const children = convert(row.children ?? []);
      return children.length
        ? [
            {
              key: row.key,
              value: row.key,
              title: row.name,
              selectable: false,
              children,
            },
          ]
        : [];
    });
  return convert(tree);
};
