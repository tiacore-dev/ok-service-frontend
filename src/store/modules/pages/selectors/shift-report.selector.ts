import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getShiftReportData = createSelector(
  [(state: IState) => state.pages.shiftReport.data],
  (shiftReports) => shiftReports
);

export const getShiftReportLoading = createSelector(
  [(state: IState) => state.pages.shiftReport.loading],
  (loading) => loading
);
