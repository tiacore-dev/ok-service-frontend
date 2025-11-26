export type ObjectsSortField = "name" | "city" | "status" | "manager";

export interface IObjectsFiltersState {
  search: string;
  statusId?: string;
  cityId?: string;
  managerId?: string;
  sortField: ObjectsSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultObjectsFiltersState: IObjectsFiltersState = {
  search: "",
  statusId: undefined,
  cityId: undefined,
  managerId: undefined,
  sortField: "name",
  sortOrder: "ascend",
};
