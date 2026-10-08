export type ShiftReportsDeletedFilter = "all" | "active" | "deleted";
export type ShiftReportsSignedFilter = "true" | "false";

export interface IShiftReportsFiltersState {
  users: string[];
  projects: string[];
  projectLeaders: string[];
  places: string[];
  dateFrom?: number | null;
  dateTo?: number | null;
  signed?: ShiftReportsSignedFilter;
  deletedFilter: ShiftReportsDeletedFilter;
}

export const defaultShiftReportsFiltersState: IShiftReportsFiltersState = {
  users: [],
  projects: [],
  projectLeaders: [],
  places: [],
  dateFrom: null,
  dateTo: null,
  signed: undefined,
  deletedFilter: "active",
};
