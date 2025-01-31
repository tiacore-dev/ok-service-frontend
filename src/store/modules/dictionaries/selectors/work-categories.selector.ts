import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { IWorkCategory } from "../../../../interfaces/workCategories/IWorkCategory";

export const getWorkCategoriesAsArray = createSelector(
  [(state: IState) => state.pages.workCategories.data],
  (workCategories) => workCategories
);

export const loadedWorkCategories = createSelector(
  [(state: IState) => state.pages.workCategories.loaded],
  (workCategories) => workCategories
);

export const getWorkCategoriesMap = createSelector(
  [(state: IState) => state.pages.workCategories.data],
  (workCategories) => {
    const map: Record<string, IWorkCategory> = {};
    workCategories.forEach(
      (category) => (map[category.work_category_id] = category)
    );
    return map;
  }
);
