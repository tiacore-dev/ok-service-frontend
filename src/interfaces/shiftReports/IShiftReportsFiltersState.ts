export interface IShiftReportsFiltersState {
  users: string[];
  projects: string[];
  projectLeaders: string[];
  places: string[];
  dateFrom?: number | null;
  dateTo?: number | null;
}

export const defaultShiftReportsFiltersState: IShiftReportsFiltersState = {
  users: [],
  projects: [],
  projectLeaders: [],
  places: [],
  dateFrom: null,
  dateTo: null,
};
