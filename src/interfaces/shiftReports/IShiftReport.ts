export interface IShiftReport {
  shift_report_id?: string;
  number: number;
  user: string;
  date?: number;
  date_to?: number;
  date_from?: number;
  project: string;
  signed: boolean;
  night_shift: boolean;
  extreme_conditions: boolean;
  deleted?: boolean;
  shift_report_details_sum?: number;
}

export interface IShiftReportQueryParams {
  offset?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  user?: string;
  date_from?: number;
  date_to?: number;
  project?: string;
}

export interface IShiftReportsResponse {
  shift_reports: IShiftReport[];
  total: number;
}

export interface ShiftReportApiResponse {
  msg: string;
  shift_report: IShiftReport;
}
