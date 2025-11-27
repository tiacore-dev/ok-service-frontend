export interface IShiftReport {
  shift_report_id?: string;
  number: number;
  user: string;
  date?: number;
  date_start?: number;
  date_end?: number;
  project: string;
  signed: boolean;
  night_shift: boolean;
  extreme_conditions: boolean;
  deleted?: boolean;
  shift_report_details_sum?: number;
  lng?: number;
  ltd?: number;
}

export interface IShiftReportQueryParams {
  offset?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  user?: string | string[];
  date_from?: number;
  date_to?: number;
  date_start_from?: number;
  date_start_to?: number;
  date_end_from?: number;
  date_end_to?: number;
  project?: string | string[];
  lng?: number;
  ltd?: number;
}

export interface IShiftReportsResponse {
  shift_reports: IShiftReport[];
  total: number;
}

export interface ShiftReportApiResponse {
  msg: string;
  shift_report: IShiftReport;
}
