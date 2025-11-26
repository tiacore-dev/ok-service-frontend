export type ObjectProjectsSortField = "name" | "leader";

export interface IObjectProjectsFiltersState {
  search: string;
  leaderId?: string;
  sortField: ObjectProjectsSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultObjectProjectsFiltersState: IObjectProjectsFiltersState = {
  search: "",
  leaderId: undefined,
  sortField: "name",
  sortOrder: "ascend",
};
