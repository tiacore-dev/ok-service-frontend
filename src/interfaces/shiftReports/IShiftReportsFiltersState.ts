export interface IShiftReportsFiltersState {
  users: string[];
  projects: string[];
  projectLeaders: string[];
  dateFrom?: number | null;
  dateTo?: number | null;
}

export const defaultShiftReportsFiltersState: IShiftReportsFiltersState = {
  users: [],
  projects: [],
  projectLeaders: [],
  dateFrom: null,
  dateTo: null,
};
