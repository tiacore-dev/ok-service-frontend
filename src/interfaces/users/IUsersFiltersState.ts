export type UsersSortField = "name" | "login" | "category" | "role" | "city";

export interface IUsersFiltersState {
  search: string;
  roleId?: string;
  cityId?: string;
  category?: number | null;
  sortField: UsersSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultUsersFiltersState: IUsersFiltersState = {
  search: "",
  roleId: undefined,
  cityId: undefined,
  category: null,
  sortField: "name",
  sortOrder: "ascend",
};
