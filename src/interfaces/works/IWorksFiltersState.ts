export type WorksSortField =
  | "name"
  | "category"
  | "price1"
  | "price2"
  | "price3"
  | "price4";

export type WorksDeletedFilter = "active" | "deleted" | "all";

export interface WorksFiltersState {
  search: string;
  categoryId?: string;
  deletedFilter: WorksDeletedFilter;
  sortField: WorksSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultWorksFiltersState: WorksFiltersState = {
  search: "",
  categoryId: undefined,
  deletedFilter: "active",
  sortField: "name",
  sortOrder: "ascend",
};
