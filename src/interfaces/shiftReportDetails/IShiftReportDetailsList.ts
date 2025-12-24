import { IPopulatedShiftReportDetail } from "./IShiftReportDetail";

export interface IShiftReportDetailsList extends IPopulatedShiftReportDetail {}

export interface IShiftReportDetailsListColumn extends IShiftReportDetailsList {
  key: string;
  check?: string;
  blocked?: boolean;
}
