export type MaterialsSortField = "name" | "measurement_unit" | "created_at";

export type MaterialsDeletedFilter = "active" | "deleted" | "all";

export interface MaterialsFiltersState {
  search: string;
  deletedFilter: MaterialsDeletedFilter;
  sortField: MaterialsSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultMaterialsFiltersState: MaterialsFiltersState = {
  search: "",
  deletedFilter: "active",
  sortField: "name",
  sortOrder: "ascend",
};
