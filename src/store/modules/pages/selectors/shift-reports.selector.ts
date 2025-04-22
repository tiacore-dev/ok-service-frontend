import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getShiftReportsData = createSelector(
  [(state: IState) => state.pages.shiftReports.data],
  (shiftReports) => shiftReports,
);
