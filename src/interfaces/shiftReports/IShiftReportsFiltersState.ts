export interface IShiftReportsFiltersState {
  users: string[];
  projects: string[];
  dateFrom?: number | null;
  dateTo?: number | null;
}

export const defaultShiftReportsFiltersState: IShiftReportsFiltersState = {
  users: [],
  projects: [],
  dateFrom: null,
  dateTo: null,
};

