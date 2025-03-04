import { IShiftReportDetail } from "./IShiftReportDetail";

export interface IShiftReportDetailsList extends IShiftReportDetail {}

export interface IShiftReportDetailsListColumn extends IShiftReportDetailsList {
  key: string;
  check?: string;
  blocked?: boolean;
}
