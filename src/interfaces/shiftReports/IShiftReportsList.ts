import { IShiftReport } from "./IShiftReport";

export interface IShiftReportsList extends IShiftReport {}

export interface IShiftReportsListColumn extends IShiftReportsList {
  key: string;
}
