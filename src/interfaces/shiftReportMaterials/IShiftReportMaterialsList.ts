import { IShiftReportMaterial } from "./IShiftReportMaterial";

export interface IShiftReportMaterialsList extends IShiftReportMaterial {}

export interface IShiftReportMaterialsListColumn
  extends IShiftReportMaterialsList {
  key: string;
}
