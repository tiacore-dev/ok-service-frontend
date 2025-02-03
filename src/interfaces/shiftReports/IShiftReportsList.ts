import { IShiftReport } from "./IShiftReport";

export interface IShiftReportsList extends IShiftReport {
  shift_report_details_sum: number;
}

export interface IShiftReportsListColumn extends IShiftReportsList {
  key: string;
}
