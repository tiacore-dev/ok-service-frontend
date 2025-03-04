import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const selectProjectStat = createSelector(
  [(state: IState) => state.pages.project.stat],
  (stat) => stat,
);
