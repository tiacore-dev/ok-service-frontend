export type UsersSortField = "name" | "login" | "category" | "role" | "city";
export type UsersDeletedFilter = "active" | "deleted" | "all";

export interface IUsersFiltersState {
  search: string;
  roleId?: string;
  cityId?: string;
  category?: number | null;
  deletedFilter: UsersDeletedFilter;
  sortField: UsersSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultUsersFiltersState: IUsersFiltersState = {
  search: "",
  roleId: undefined,
  cityId: undefined,
  category: null,
  deletedFilter: "active",
  sortField: "name",
  sortOrder: "ascend",
};
