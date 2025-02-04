import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";

export const getWorkCategoriesState = createSelector(
  [
    (state: IState) => state.pages.workCategories,
  ],
  (workCategories) => workCategories
);
