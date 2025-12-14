export type ProjectWorksSortField = "name" | "quantity";
export type ProjectWorksSignedFilter = "all" | "signed" | "unsigned";

export interface IProjectWorksFiltersState {
  search: string;
  workId?: string;
  signed: ProjectWorksSignedFilter;
  sortField: ProjectWorksSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultProjectWorksFiltersState: IProjectWorksFiltersState = {
  search: "",
  workId: undefined,
  signed: "all",
  sortField: "name",
  sortOrder: "ascend",
};
