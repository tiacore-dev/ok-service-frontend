import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getshiftReportDetailsByShiftReportId = createSelector(
  [
    (state: IState) => state.pages.shiftReportDetails.data,
    (_, shift_report_id?: string) => shift_report_id,
  ],
  (shiftReportDetails, shift_report_id) =>
    shiftReportDetails.filter((el) => el.shift_report === shift_report_id)
);
